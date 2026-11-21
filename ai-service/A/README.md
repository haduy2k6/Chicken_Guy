# Model artifacts

`final_convnext_tiny.pth` is the production 25-member ensemble bundle (5 seeds x 5 folds) consumed by `app.main`. It contains model states, JPEG quantization tables, resize/normalization metadata, and the frozen decision threshold calibrated via out-of-fold development predictions.

- Dataset Fingerprint: `feb9fd7dce3cf1f6`
- Architecture: `convnext_tiny` (`convnext_tiny.fb_in1k`)
- Decision Threshold: `0.4255558669567108`
- Test ROC-AUC: `0.9393`
- Test Average Precision: `0.9325`
- Sensitivity / Specificity: `92.31% / 75.86%`
- Inference Strategy: Square multi-crop (scales 1.0, 0.8, 0.6 on a 3x3 grid) with ensemble Grad-CAM on the highest class-1 probability crop.
