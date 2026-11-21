from __future__ import annotations

import io
from pathlib import Path

import numpy as np
import timm
import torch
import torch.nn.functional as F
from PIL import Image, ImageOps


def load_bundle(path: str | Path, device: str | torch.device = 'cpu') -> dict:
    bundle = torch.load(path, map_location='cpu', weights_only=True)
    if bundle.get('format_version', 1) != 1:
        raise ValueError('Unsupported model bundle format')
    if not {'arch', 'timm_name', 'members', 'size', 'mean', 'std', 'threshold'} <= set(bundle):
        raise ValueError('Model bundle is missing required architecture or preprocessing metadata')
    models = []
    for state in bundle['members']:
        model = timm.create_model(bundle['timm_name'], pretrained=False, num_classes=1)
        model.load_state_dict(state, strict=True)
        model.eval().to(device)
        for parameter in model.parameters():
            parameter.requires_grad_(False)
        models.append(model)
    bundle['models'] = models
    bundle['device'] = torch.device(device)
    return bundle


def square_crops(image: Image.Image, crop_scales=(1.0, 0.8, 0.6), grid: int = 3):
    image = ImageOps.exif_transpose(image).convert('RGB')
    width, height = image.size
    side = min(width, height)
    found = {}
    for scale in crop_scales:
        length = max(1, min(side, round(side * float(scale))))
        xs = np.linspace(0, width - length, grid).round().astype(int)
        ys = np.linspace(0, height - length, grid).round().astype(int)
        positions = {(int(x), int(y)) for y in ys for x in xs}
        positions.add(((width - length) // 2, (height - length) // 2))
        for left, top in sorted(positions):
            box = (left, top, left + length, top + length)
            found.setdefault(box, image.crop(box))
    return [(crop, box) for box, crop in found.items()]


def preprocess(image: Image.Image, bundle: dict) -> torch.Tensor:
    image = ImageOps.exif_transpose(image).convert('RGB')
    size = int(bundle['size'])
    if image.size != (size, size):
        image = image.resize((size, size), Image.Resampling.BICUBIC)
    jpeg = bundle.get('jpeg')
    if jpeg:
        buf = io.BytesIO()
        image.save(buf, 'JPEG', qtables={int(k): v for k, v in jpeg['qtables'].items()},
                   subsampling=jpeg['sampling'])
        buf.seek(0)
        with Image.open(buf) as decoded:
            image = decoded.convert('RGB').copy()
    array = np.asarray(image, dtype=np.float32) / 255.0
    array = (array - np.asarray(bundle['mean'], np.float32)) / np.asarray(bundle['std'], np.float32)
    return torch.from_numpy(array).permute(2, 0, 1)


@torch.inference_mode()
def predict(bundle: dict, images: list[Image.Image], batch_size: int = 8) -> np.ndarray:
    tensors = torch.stack([preprocess(image, bundle) for image in images]).to(bundle['device'])
    probs = []
    for start in range(0, len(tensors), batch_size):
        batch = tensors[start:start + batch_size]
        member_probs = torch.stack([torch.sigmoid(model(batch).reshape(-1)) for model in bundle['models']])
        probs.extend(member_probs.mean(0).cpu().numpy().tolist())
    return np.asarray(probs, dtype=np.float32)


def predict_multicrop(bundle: dict, image: Image.Image, crop_scales=(1.0, 0.8, 0.6), grid: int = 3) -> dict:
    views = square_crops(image, crop_scales, grid)
    probabilities = predict(bundle, [crop for crop, _ in views])
    threshold = float(bundle['threshold'])
    crops = [{'box': list(box), 'probability': float(prob), 'label': int(prob >= threshold)}
             for (_crop, box), prob in zip(views, probabilities, strict=True)]
    crops.sort(key=lambda item: item['probability'], reverse=True)
    return {'probability': crops[0]['probability'], 'label': crops[0]['label'],
            'threshold': threshold, 'best_crop': crops[0], 'crops': crops}


def _target_layer(model: torch.nn.Module, arch: str):
    if arch == 'convnext_tiny':
        return model.stages[-1]
    if arch == 'resnest26d':
        return model.layer4[-1]
    raise ValueError(f'Unsupported Grad-CAM architecture: {arch}')


def gradcam(bundle: dict, image: Image.Image, crop_box=None) -> np.ndarray:
    from captum.attr import LayerGradCam
    image = ImageOps.exif_transpose(image).convert('RGB')
    if crop_box is not None:
        image = image.crop(tuple(crop_box))
    else:
        width, height = image.size
        side = min(width, height)
        left, top = (width - side) // 2, (height - side) // 2
        image = image.crop((left, top, left + side, top + side))
    x = preprocess(image, bundle).unsqueeze(0).to(bundle['device'])
    heatmaps = []
    for model in bundle['models']:
        target = _target_layer(model, bundle['arch'])
        attribution = LayerGradCam(model, target).attribute(x, target=0, relu_attributions=True)
        cam = F.interpolate(attribution, size=(int(bundle['size']), int(bundle['size'])),
                            mode='bilinear', align_corners=False)[0, 0]
        cam = cam / cam.max().clamp_min(1e-8)
        heatmaps.append(cam.detach())
    return torch.stack(heatmaps).mean(0).cpu().numpy().astype(np.float32)
