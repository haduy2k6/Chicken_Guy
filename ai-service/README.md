# AI analysis service

FastAPI loads a bundle from `AI_MODEL_PATH` (default: `A/final_resnest26d.pth`). It scores square crops at scales 1.0, 0.8 and 0.6 across a 3x3 spatial grid, soft-votes members per crop, selects the highest class-1 crop, and computes ensemble Grad-CAM for that crop. The callback returns crop coordinates and individual crop scores. The loader supports ResNeSt-26d and ConvNeXt-Tiny bundles.

The ResNeSt file currently in `A/` is an existing legacy bundle. Its stored report predates the multi-crop serving change, so its old test metrics do not validate the current inference path. The rebuilt notebooks now export into this exact `A/` directory; run NV2 audit, NV3 tuning, NV1 final training, then NV2 blind test evaluation before treating either bundle as the current evaluated deployment.

To switch architectures, set `AI_MODEL_PATH=A/final_convnext_tiny.pth` and `AI_MODEL_VERSION=convnext_tiny-ensemble-v1` in `.env` after that bundle is exported.

## Run locally

Create `.env` from `.env.example` and configure S3 plus service/callback keys. Then run:

```bash
cd ai-service
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Health check: `GET /health`.
