import argparse
from PIL import Image
from inference import load_bundle, predict
p = argparse.ArgumentParser()
p.add_argument('--model', required=True)
p.add_argument('--image', required=True)
p.add_argument('--device', default='cpu', choices=['cpu', 'cuda'])
a = p.parse_args()
b = load_bundle(a.model, a.device)
with Image.open(a.image) as im:
    prob, label = predict(b, [im])
print({'label': int(label[0]), 'label_name': 'ung_thu' if label[0] else 'khong_ung_thu',
       'probability_ung_thu': float(prob[0]), 'threshold': float(b['threshold'])})
