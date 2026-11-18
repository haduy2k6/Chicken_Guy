interface HttpErrorLike {
  message?: string;
  response?: { status?: number; data?: { message?: string | string[]; code?: string } };
}

/** Mã lỗi 409 của backend */
const CONFLICT_MESSAGES: Record<string, string> = {
  SLOT_TAKEN: "Khung giờ hẹn đã có lịch hoặc bác sĩ đã đủ 3 ca trong ngày. Hãy chọn giờ khác.",
  VERSION_CONFLICT: "Ca bệnh vừa được cập nhật ở nơi khác. Hãy xem lại nội dung mới rồi gửi lại.",
};

/** Thông báo lỗi từ phản hồi API (message có thể là mảng khi validate) */
export function errMsg(err: unknown, fallback = "Đã có lỗi xảy ra"): string {
  const e = (typeof err === "object" && err !== null ? err : {}) as HttpErrorLike;
  const code = e.response?.data?.code;
  if (e.response?.status === 409 && code && CONFLICT_MESSAGES[code]) return CONFLICT_MESSAGES[code];
  const server = e.response?.data?.message;
  if (server) return [server].flat().join(", ");
  return e.message?.trim() || fallback;
}
