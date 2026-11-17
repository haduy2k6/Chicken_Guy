// src/common/upload-error.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import type { Response } from 'express';

/** multer ném thông báo tiếng Anh; đổi sang tiếng Việt để UploadStep hiển thị trực tiếp */
const MESSAGES: Record<string, string> = {
  'File too large': 'Mỗi ảnh tối đa 4MB. Hãy chọn ảnh nhỏ hơn.',
  'Too many files': 'Tối đa 10 ảnh mỗi lần gửi.',
  'Unexpected field': 'Tối đa 10 ảnh mỗi lần gửi.',
  'Field value too long': 'Có trường trong biểu mẫu quá dài.',
  'Too many fields': 'Biểu mẫu có quá nhiều trường.',
};

@Catch(HttpException)
export class UploadErrorFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();
    const status = exception.getStatus();
    const body = exception.getResponse();

    const raw = typeof body === 'string' ? body : (body as { message?: unknown })?.message;
    const text = Array.isArray(raw) ? raw[0] : raw;
    const mapped = typeof text === 'string' ? MESSAGES[text] : undefined;

    if (mapped) {
      res.status(status).json({ statusCode: status, code: 'UPLOAD_LIMIT', message: mapped });
      return;
    }
    res.status(status).json(typeof body === 'string' ? { statusCode: status, message: body } : body);
  }
}
