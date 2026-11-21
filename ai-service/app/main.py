from __future__ import annotations

import hmac
import io
import logging
import os
import threading
from contextlib import asynccontextmanager
from typing import Any

import boto3
import httpx
import numpy as np
import torch
import torch.nn.functional as F
import timm
from dotenv import load_dotenv
from fastapi import BackgroundTasks, FastAPI, Header, HTTPException
from huggingface_hub import hf_hub_download
from PIL import Image, ImageOps
from pydantic import BaseModel, Field, HttpUrl

LOGGER = logging.getLogger("ai-service")
load_dotenv()
MODEL_PATH = os.getenv("AI_MODEL_PATH", "A/final_convnext_tiny.pth")
DEVICE = torch.device("cuda" if torch.cuda.is_available() and os.getenv("AI_DEVICE", "auto") != "cpu" else "cpu")
MODEL_NAME = "npc-image-ensemble"
model_arch = "convnext_tiny"
MODEL_VERSION = os.getenv("AI_MODEL_VERSION", "convnext_tiny-ensemble-v1")
MAX_IMAGE_BYTES = 12 * 1024 * 1024
MAX_PIXELS = 40_000_000
input_size = 224
mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
jpeg_tables: dict[int, list[int]] = {}
jpeg_sampling = 2

models: list[torch.nn.Module] = []
model_threshold = 0.5
model_lock = threading.Lock()
accepted_jobs: set[str] = set()
jobs_lock = threading.Lock()
s3 = boto3.client(
    "s3",
    region_name=os.getenv("S3_REGION", "us-east-1"),
    endpoint_url=os.getenv("S3_ENDPOINT") or None,
    aws_access_key_id=os.getenv("S3_ACCESS_KEY"),
    aws_secret_access_key=os.getenv("S3_SECRET_KEY"),
)
bucket = os.getenv("S3_BUCKET", "")
service_key = os.getenv("AI_SERVICE_KEY", "")
callback_secret = os.getenv("AI_CALLBACK_SECRET", "")


class AnalysisJob(BaseModel):
    analysis_id: str
    case_id: str
    image_key: str = Field(min_length=1, max_length=500)
    mime_type: str = Field(pattern=r"^image/(jpeg|png|webp|jpg)$")
    gradcam_key: str = Field(min_length=1, max_length=500)
    callback_url: HttpUrl


def load_model() -> None:
    global models, model_threshold, input_size, mean, std, jpeg_tables, jpeg_sampling, model_arch, MODEL_NAME, MODEL_PATH
    if not os.path.isfile(MODEL_PATH):
        # Try to download from Hugging Face Hub if repository info provided
        hf_repo = os.getenv("HF_MODEL_REPO")
        hf_token = os.getenv("HF_MODEL_TOKEN")
        if hf_repo:
            try:
                local_path = hf_hub_download(
                    repo_id=hf_repo,
                    filename=MODEL_PATH,
                    token=hf_token,
                )
                MODEL_PATH = local_path
                LOGGER.info("Downloaded model checkpoint from HF Hub: %s", MODEL_PATH)
            except Exception as e:
                raise RuntimeError(f"Failed to download model from HF Hub: {e}")
        else:
            raise RuntimeError(f"Không tìm thấy checkpoint: {MODEL_PATH} và không có cấu hình HF_MODEL_REPO")


    # weights_only avoids executing arbitrary Python objects embedded in a checkpoint.
    checkpoint: dict[str, Any] = torch.load(MODEL_PATH, map_location="cpu", weights_only=True)
    architectures = {
        "resnest26d": "resnest26d.gluon_in1k",
        "convnext_tiny": "convnext_tiny.fb_in1k",
    }
    arch = checkpoint.get("arch")
    if arch not in architectures or checkpoint.get("timm_name") != architectures[arch]:
        raise RuntimeError("Checkpoint phải là bundle ResNeSt-26d hoặc ConvNeXt-Tiny đúng timm_name")

    members = checkpoint.get("members")
    if not isinstance(members, list) or not members or not all(isinstance(member, dict) for member in members):
        raise RuntimeError("Checkpoint phải chứa danh sách state_dict của ensemble")

    loaded_models: list[torch.nn.Module] = []
    for member in members:
        network = timm.create_model(checkpoint["timm_name"], pretrained=False, num_classes=1)
        state_dict = {key: value.float() if value.is_floating_point() else value for key, value in member.items()}
        network.load_state_dict(state_dict, strict=True)
        network.eval().to(DEVICE)
        for parameter in network.parameters():
            parameter.requires_grad_(False)
        loaded_models.append(network)

    size = int(checkpoint.get("size", 0))
    threshold = float(checkpoint.get("threshold", -1))
    input_mean = np.asarray(checkpoint.get("mean"), dtype=np.float32)
    input_std = np.asarray(checkpoint.get("std"), dtype=np.float32)
    jpeg = checkpoint.get("jpeg")
    if size <= 0 or not 0 <= threshold <= 1 or input_mean.shape != (3,) or input_std.shape != (3,):
        raise RuntimeError("Metadata preprocessing/threshold trong checkpoint không hợp lệ")
    if not isinstance(jpeg, dict) or not isinstance(jpeg.get("qtables"), dict):
        raise RuntimeError("Checkpoint thiếu bảng JPEG dùng khi huấn luyện")

    models = loaded_models
    model_arch = arch
    MODEL_NAME = f"{arch}-npc-ensemble"
    model_threshold = threshold
    input_size = size
    mean, std = input_mean, input_std
    jpeg_tables = {int(key): values for key, values in jpeg["qtables"].items()}
    jpeg_sampling = jpeg["sampling"]
    LOGGER.info("Loaded %s (%d members) on %s (threshold %.4f)", MODEL_NAME, len(models), DEVICE, model_threshold)


@asynccontextmanager
async def lifespan(_: FastAPI):
    load_model()
    yield


app = FastAPI(title="NPC image analysis", version=MODEL_VERSION, lifespan=lifespan)


@app.get("/health")
def health() -> dict[str, str]:
    if not models:
        raise HTTPException(status_code=503, detail="Model chưa sẵn sàng")
    return {"status": "ok", "model": MODEL_NAME, "members": str(len(models)), "device": str(DEVICE)}


def verify_key(value: str | None) -> None:
    if not service_key or value is None or not hmac.compare_digest(value, service_key):
        raise HTTPException(status_code=401, detail="Không được phép")


def read_image(key: str) -> Image.Image:
    if not bucket:
        raise RuntimeError("Thiếu cấu hình S3_BUCKET")
    response = s3.get_object(Bucket=bucket, Key=key)
    body = response["Body"]
    data = body.read(MAX_IMAGE_BYTES + 1)
    body.close()
    if len(data) > MAX_IMAGE_BYTES:
        raise ValueError("Ảnh vượt quá giới hạn xử lý")
    with Image.open(io.BytesIO(data)) as source:
        if source.width * source.height > MAX_PIXELS:
            raise ValueError("Kích thước ảnh vượt giới hạn xử lý")
        return ImageOps.exif_transpose(source).convert("RGB")


def square_crops(image: Image.Image, crop_scales: tuple[float, ...] = (1.0, 0.8, 0.6), grid: int = 3):
    """Generate unique square crops with source-image pixel boxes."""
    image = ImageOps.exif_transpose(image).convert("RGB")
    width, height = image.size
    side = min(width, height)
    found: dict[tuple[int, int, int, int], Image.Image] = {}
    for scale in crop_scales:
        length = max(1, min(side, round(side * float(scale))))
        xs = np.linspace(0, width - length, grid).round().astype(int)
        ys = np.linspace(0, height - length, grid).round().astype(int)
        offsets = {(int(x), int(y)) for y in ys for x in xs}
        offsets.add(((width - length) // 2, (height - length) // 2))
        for left, top in sorted(offsets):
            box = (left, top, left + length, top + length)
            found.setdefault(box, image.crop(box))
    return [(crop, box) for box, crop in found.items()]


def preprocess_image(image: Image.Image) -> tuple[Image.Image, torch.Tensor]:
    processed = ImageOps.exif_transpose(image).convert("RGB")
    if processed.size != (input_size, input_size):
        processed = processed.resize((input_size, input_size), Image.Resampling.BICUBIC)
    encoded = io.BytesIO()
    processed.save(encoded, format="JPEG", qtables=jpeg_tables, subsampling=jpeg_sampling)
    encoded.seek(0)
    with Image.open(encoded) as decoded:
        pixels = np.asarray(decoded.convert("RGB"), dtype=np.float32) / 255.0
    tensor = (pixels - mean) / std
    return processed, torch.from_numpy(tensor).permute(2, 0, 1).unsqueeze(0).to(DEVICE)

def gradcam_png(image: Image.Image, input_tensor: torch.Tensor) -> tuple[bytes, float]:
    if not models:
        raise RuntimeError("Model chưa sẵn sàng")
    activations: list[torch.Tensor | None] = [None] * len(models)
    gradients: list[torch.Tensor | None] = [None] * len(models)
    hooks = []
    for index, network in enumerate(models):
        if model_arch == "convnext_tiny":
            target = network.stages[-1]
        else:
            target = network.layer4[-1]

        def save_activation(_module: torch.nn.Module, _inputs: tuple[torch.Tensor, ...], output: torch.Tensor, i: int = index) -> None:
            activations[i] = output

        def save_gradient(
            _module: torch.nn.Module,
            _grad_input: tuple[torch.Tensor | None, ...],
            grad_output: tuple[torch.Tensor, ...],
            i: int = index,
        ) -> None:
            gradients[i] = grad_output[0]

        hooks.extend((target.register_forward_hook(save_activation), target.register_full_backward_hook(save_gradient)))

    try:
        x = input_tensor.detach().requires_grad_(True)
        logits = torch.stack([network(x).reshape(()) for network in models])
        member_probabilities = torch.sigmoid(logits)
        probability = member_probabilities.mean()
        probability.backward()

        heatmaps = []
        for activation, gradient in zip(activations, gradients, strict=True):
            if activation is None or gradient is None:
                raise RuntimeError("Không thu được activation/gradient cho Grad-CAM")
            features, grads = activation[0], gradient[0]
            weights = grads.mean(dim=(1, 2), keepdim=True)
            heat = F.relu((weights * features).sum(dim=0))
            heatmaps.append(heat / heat.max().clamp_min(1e-8))

        heat = torch.stack(heatmaps).mean(dim=0)
        heat = heat / heat.max().clamp_min(1e-8)
        heatmap = F.interpolate(heat[None, None], size=(input_size, input_size), mode="bilinear", align_corners=False)[0, 0]
        values = heatmap.detach().cpu().numpy()
        red = np.clip(255 * values * 2.0, 0, 255)
        blue = np.clip(255 * (1.0 - values) * 1.5, 0, 255)
        green = np.clip(255 * (1.0 - np.abs(values - 0.5) * 2.0), 0, 255)
        color = np.stack([red, green, blue], axis=-1).astype(np.uint8)
        overlay = (np.asarray(image, dtype=np.float32) * 0.55 + color * 0.45).clip(0, 255).astype(np.uint8)
        output = io.BytesIO()
        Image.fromarray(overlay).save(output, format="PNG", optimize=True)
        return output.getvalue(), float(probability.detach().item())
    finally:
        for hook in hooks:
            hook.remove()


def predict(image: Image.Image) -> tuple[float, bytes, dict[str, Any]]:
    """Score square multi-crops and Grad-CAM the highest class-1 probability crop."""
    if not models:
        raise RuntimeError("Model chưa sẵn sàng")
    oriented = ImageOps.exif_transpose(image).convert("RGB")
    views = square_crops(oriented, crop_scales=(1.0, 0.8, 0.6), grid=3)
    with model_lock:
        processed_views = [preprocess_image(crop) for crop, _box in views]
        tensors = torch.cat([tensor for _processed, tensor in processed_views], dim=0)
        probabilities = []
        with torch.no_grad():
            for start in range(0, len(tensors), 8):
                batch = tensors[start:start + 8]
                member_probs = torch.stack([torch.sigmoid(network(batch).reshape(-1)) for network in models])
                probabilities.extend(member_probs.mean(dim=0).cpu().tolist())
        ranked = sorted(
            ({"box": list(box), "probability": float(prob), "label": int(float(prob) >= model_threshold)}
             for (_crop, box), prob in zip(views, probabilities, strict=True)),
            key=lambda item: item["probability"], reverse=True,
        )
        best = ranked[0]
        best_index = next(i for i, (_crop, box) in enumerate(views) if list(box) == best["box"])
        processed, input_tensor = processed_views[best_index]
        heatmap, cam_probability = gradcam_png(processed, input_tensor)
    details = {"best_crop": best, "crops": ranked, "gradcam_probability": cam_probability}
    return best["probability"], heatmap, details

def process_job(job: AnalysisJob) -> None:
    try:
        image = read_image(job.image_key)
        probability, heatmap, crop_details = predict(image)
        s3.put_object(Bucket=bucket, Key=job.gradcam_key, Body=heatmap, ContentType="image/png")
        payload = {
            "analysis_id": job.analysis_id,
            "status": "completed",
            "model_name": MODEL_NAME,
            "model_version": MODEL_VERSION,
            "predicted_label": "malignant" if probability >= model_threshold else "benign",
            "probabilities": {"malignant": probability, "benign": 1.0 - probability},
            "risk_score": round(probability * 100, 4),
            "gradcam_key": job.gradcam_key,
            "raw_output": {
                "threshold": model_threshold,
                "ensemble_members": len(models),
                "aggregation": "soft_voting_max_over_square_multicrops",
                "best_crop": crop_details["best_crop"],
                "crops": crop_details["crops"],
                "gradcam_probability": crop_details["gradcam_probability"],
            },
        }
    except Exception as exc:
        LOGGER.exception("Analysis failed: %s", job.analysis_id)
        payload = {"analysis_id": job.analysis_id, "status": "failed", "error_message": str(exc)[:1000]}

    try:
        response = httpx.post(
            str(job.callback_url),
            json=payload,
            headers={"X-AI-Key": callback_secret},
            timeout=20.0,
        )
        response.raise_for_status()
    except Exception:
        LOGGER.exception("Callback failed: %s", job.analysis_id)
        raise
    finally:
        with jobs_lock:
            accepted_jobs.discard(job.analysis_id)


@app.post("/jobs", status_code=202)
async def submit_job(
    job: AnalysisJob,
    background_tasks: BackgroundTasks,
    x_ai_key: str | None = Header(default=None),
) -> dict[str, str]:
    verify_key(x_ai_key)
    if not models:
        raise HTTPException(status_code=503, detail="Model chưa sẵn sàng")
    if not callback_secret:
        raise HTTPException(status_code=503, detail="Thiếu AI_CALLBACK_SECRET")
    with jobs_lock:
        if job.analysis_id in accepted_jobs:
            return {"status": "accepted", "analysis_id": job.analysis_id}
        accepted_jobs.add(job.analysis_id)
    background_tasks.add_task(process_job, job)
    return {"status": "accepted", "analysis_id": job.analysis_id}
