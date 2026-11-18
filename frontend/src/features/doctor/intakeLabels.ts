// Nhãn hiển thị cho intakeData (khóa camelCase do backend lưu, xem backend case-support/intake-schema.ts).
export const INTAKE_LABELS: Record<string, string> = {
  age: "Tuổi",
  gender: "Giới tính",
  tobacco: "Hút thuốc lá",
  alcohol: "Uống rượu bia",
  betelQuid: "Nhai trầu",
  hpv: "Nhiễm HPV",
  sunExposure: "Phơi nắng kéo dài",
  oralHygiene: "Vệ sinh răng miệng kém",
  familyHistory: "Tiền sử gia đình mắc ung thư",
  immune: "Suy giảm miễn dịch",
  diet: "Chế độ ăn rau quả",
  lesions: "Tổn thương trong miệng",
  bleeding: "Chảy máu bất thường",
  swallowing: "Khó nuốt",
  patches: "Mảng trắng/đỏ trong miệng",
  creatinine: "Creatinine máu (mg/dL)",
  systolic: "Huyết áp tâm thu (mmHg)",
  diastolic: "Huyết áp tâm trương (mmHg)",
  proteinuria: "Protein niệu",
};

const VALUE_LABELS: Record<string, string> = {
  Yes: "Có", No: "Không",
  Male: "Nam", Female: "Nữ", Other: "Khác",
  Low: "Thấp", Moderate: "Trung bình", High: "Cao",
  negative: "Âm tính", trace: "Vết", "1plus": "1+", "2plus": "2+", "3plus": "3+",
};

/** Chuyển intakeData thành danh sách {nhãn, giá trị} để panel bác sĩ hiển thị */
export function describeIntake(data: Record<string, unknown>): { key: string; label: string; value: string }[] {
  return Object.entries(data).map(([key, v]) => ({
    key,
    label: INTAKE_LABELS[key] ?? key,
    value: VALUE_LABELS[String(v)] ?? String(v),
  }));
}
