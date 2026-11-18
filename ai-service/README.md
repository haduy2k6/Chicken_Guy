# AI analysis service

FastAPI phục vụ ensemble ResNeSt-26d được huấn luyện trong `A/final_resnest26d.pth`. Pipeline dùng đúng tiền xử lý JPEG/resize/normalize được lưu trong checkpoint, soft-voting trên các thành viên và Grad-CAM tổng hợp. `ResultAI/` chứa báo cáo đánh giá và dự đoán đã xuất.

## Local

Tạo `ai-service/.env` từ `.env.example`, đặt thông tin S3 và hai khóa khớp với NestJS. Model mặc định là `A/final_resnest26d.pth`.

```bash
cd ai-service
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Health check: `GET /health`.

## Ghi chú đánh giá

Checkpoint report ghi AUC 0.968 trên tập test 110 ảnh, nhưng dữ liệu chỉ có 551 ảnh và không có patient ID; báo cáo cũng nêu ngưỡng được chọn từ OOF validation và có thể lạc quan. Đây chưa phải xác nhận hiệu năng lâm sàng trên bệnh nhân/thiết bị/đơn vị khác. Điểm model không phải xác suất chẩn đoán; bác sĩ phải đánh giá độc lập.
