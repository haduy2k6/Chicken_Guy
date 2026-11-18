export function formatAiLabel(label: string | null): string {
  if (label === "malignant") return "Mô hình ghi nhận tín hiệu cần bác sĩ đánh giá";
  if (label === "benign") return "Mô hình chưa ghi nhận tín hiệu; không loại trừ bệnh";
  return "Đã có đầu ra từ mô hình";
}
