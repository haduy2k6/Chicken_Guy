// Hạn mức do backend tính. File này chỉ giữ câu chữ hiển thị.
import type { QuotaState } from "./types";

export type { QuotaState };

export const shortId = (id: string) => `#${id.slice(0, 8)}`;

export function describeEviction(e: NonNullable<QuotaState["eviction"]>): string {
  return e.reason === "reviewed"
    ? `Bạn đã dùng hết lượt gửi. Hồ sơ ${shortId(e.caseId)} (đã có kết luận, cũ nhất) sẽ tự động bị xóa để nhường chỗ cho hồ sơ mới.`
    : `Tất cả hồ sơ đều đang chờ bác sĩ. Hồ sơ gửi gần nhất ${shortId(e.caseId)} sẽ bị thay thế bằng hồ sơ mới.`;
}

export const BLOCKED_MESSAGE =
  "Bạn đã dùng hết lượt gửi. Hãy xác nhận chuyển tuyến hoặc chờ hoàn tất lịch hẹn ở trang Lịch khám để giải phóng lượt.";
