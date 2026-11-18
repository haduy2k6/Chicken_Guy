# inference.py - dùng cho BACKEND. Phụ thuộc: torch, timm, pillow, numpy (không cần lightning/albumentations/optuna).
#   b = load_bundle('final_resnest26d.pth');  prob, label = predict(b, [Image.open('x.jpg')])
import io

import numpy as np
import timm
import torch
from PIL import Image, ImageOps


def load_bundle(path, device='cpu'):
    b = torch.load(path, map_location='cpu', weights_only=True)
    b['models'] = []
    for sd in b['members']:                                   # trọng số lưu fp16 cho nhẹ, nạp lại fp32
        m = timm.create_model(b['timm_name'], pretrained=False, num_classes=1)
        m.load_state_dict({k: v.float() if v.is_floating_point() else v for k, v in sd.items()})
        b['models'].append(m.eval().to(device))
    b['device'] = device
    return b


def preprocess(img, b):
    """Đúng chuỗi tiền xử lý lúc train: RGB -> 224x224 -> nén JPEG theo bảng lượng tử chung -> normalize ImageNet."""
    img = ImageOps.exif_transpose(img).convert('RGB')
    if img.size != (b['size'], b['size']):
        img = img.resize((b['size'], b['size']), Image.BICUBIC)
    buf = io.BytesIO()
    img.save(buf, 'JPEG', qtables={int(k): v for k, v in b['jpeg']['qtables'].items()}, subsampling=b['jpeg']['sampling'])
    x = np.asarray(Image.open(buf).convert('RGB'), np.float32) / 255
    x = (x - np.array(b['mean'], np.float32)) / np.array(b['std'], np.float32)
    return torch.from_numpy(x).permute(2, 0, 1)


@torch.no_grad()
def predict(b, images):
    """Soft voting: trung bình xác suất sigmoid của mọi thành viên. Trả (prob lớp 1, nhãn theo ngưỡng đã lưu)."""
    x = torch.stack([preprocess(i, b) for i in images]).to(b['device'])
    prob = torch.stack([torch.sigmoid(m(x).squeeze(1)) for m in b['models']]).mean(0).cpu().numpy()
    return prob, (prob >= b['threshold']).astype(int)
