import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsIn, IsOptional, IsString, IsUUID, Matches, MaxLength, ValidateNested } from 'class-validator';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const SESSIONS = ['morning', 'afternoon'] as const;

export class AvailableDoctorsQuery {
  @IsUUID() caseId!: string;
  @Matches(DATE_RE) date!: string;
}

export class BookAppointmentDto {
  @IsUUID() caseId!: string;
  @IsUUID() doctorId!: string;
  @Matches(DATE_RE) date!: string;
  @IsIn(SESSIONS) session!: (typeof SESSIONS)[number];
  @IsOptional() @IsString() @MaxLength(500) note?: string;
}

export class WeekQuery {
  @Matches(DATE_RE) weekStart!: string;
}

export class SlotDto {
  @Matches(DATE_RE) date!: string;
  @IsIn(SESSIONS) session!: (typeof SESSIONS)[number];
}

export class SetAvailabilityDto {
  @Matches(DATE_RE) weekStart!: string;

  @IsArray()
  @ArrayMaxSize(14)
  @ValidateNested({ each: true })
  @Type(() => SlotDto)
  slots!: SlotDto[];
}
