// src/common/image-type.util.ts
// Chỉ nhận JPEG/PNG/WebP (loại SVG/GIF/HTML ngụy trang vì tệp được phục vụ lại qua signed URL).
// Mimetype do client tự khai nên phải kiểm tra thêm chữ ký (magic bytes) của nội dung.
export type ImageMime = 'image/jpeg' | 'image/png' | 'image/webp';

export const IMAGE_EXT: Record<ImageMime, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

export const isAllowedImageMime = (mime: string): mime is ImageMime => mime in IMAGE_EXT;

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** Xác định loại ảnh thật từ nội dung; null nếu không phải JPEG/PNG/WebP */
export function sniffImageMime(buf: Buffer): ImageMime | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.subarray(0, 8).equals(PNG_SIGNATURE)) return 'image/png';
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  return null;
}
