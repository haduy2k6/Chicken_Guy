from __future__ import annotations
import argparse, json
from pathlib import Path
import numpy as np
from PIL import Image, ImageOps
from inference import gradcam, load_bundle, predict_multicrop

parser = argparse.ArgumentParser(description="Square multi-crop ensemble image inference")
parser.add_argument('--model', required=True)
parser.add_argument('--image', required=True)
parser.add_argument('--device', default='cpu', choices=['cpu', 'cuda'])
parser.add_argument('--cam', help='Optional Grad-CAM overlay PNG for the highest-scoring crop')
args = parser.parse_args()
bundle = load_bundle(args.model, args.device)
with Image.open(args.image) as source:
    image = ImageOps.exif_transpose(source).convert('RGB')
result = predict_multicrop(bundle, image)
if args.cam:
    box = tuple(result['best_crop']['box'])
    crop = image.crop(box)
    heat = gradcam(bundle, image, crop_box=box)
    heat_rgb = np.zeros((*heat.shape, 3), dtype=np.uint8)
    heat_rgb[..., 0] = (heat * 255).astype(np.uint8)
    overlay = Image.blend(crop.resize((heat.shape[1], heat.shape[0])), Image.fromarray(heat_rgb), 0.4)
    overlay.save(args.cam)
print(json.dumps(result, ensure_ascii=False, indent=2))
