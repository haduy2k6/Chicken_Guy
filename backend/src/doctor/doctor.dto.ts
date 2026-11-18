import { Type } from 'class-transformer';
import { IsIn, IsInt, IsISO8601, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, MaxLength, Min, ValidateNested } from 'class-validator';

export class QueueQueryDto {
  /** Ca chuyển tuyến đã kết thúc với bác sĩ nên không còn trong hàng đợi */
  @IsOptional()
  @IsIn(['all', 'pending', 'reviewed'])
  status?: 'all' | 'pending' | 'reviewed';

  /** Mã khoa (vd 'oncology') hoặc 'all' */
  @IsOptional()
  @IsString()
  @MaxLength(50)
  specialty?: string;
}

export class ReferralDto {
  @IsOptional() @IsUUID() toDoctorId?: string;
  @IsOptional() @IsUUID() toSpecialtyId?: string;
}

/** Khớp ReviewCaseRequest ở frontend */
export class ReviewCaseDto {
  @IsIn(['reviewed', 'escalated'])
  status!: 'reviewed' | 'escalated';

  @IsString() @IsNotEmpty() @MaxLength(5000)
  notes!: string;

  @IsInt() @Min(0)
  expectedVersion!: number;

  @IsOptional() @IsObject()
  assessmentData?: Record<string, unknown>;

  /** ISO 8601, chỉ dùng khi status = reviewed */
  @IsOptional() @IsISO8601()
  followUpAt?: string;

  @IsOptional() @ValidateNested() @Type(() => ReferralDto)
  referral?: ReferralDto;
}
