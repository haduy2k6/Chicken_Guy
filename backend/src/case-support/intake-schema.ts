// src/case-support/intake-schema.ts
// Nguồn duy nhất định nghĩa form khai báo từng khoa (thay cho bảng specialty_forms).
// Thêm khoa mới = thêm một mục vào INTAKE; khóa là camelCase ổn định, giá trị enum giữ nguyên tiếng Anh.
import { BadRequestException } from '@nestjs/common';
import { ImageKind } from '../Entity-User/CaseImage.entity.js';

type Field =
  | { type: 'int' | 'number'; min: number; max: number }
  | { type: 'enum'; values: readonly string[] };

export interface IntakeDef {
  code: string;
  name: string;
  requiresImages: boolean;
  aiEnabled: boolean;
  imageKind: ImageKind;
  fields: Record<string, Field>;
  /** Các trường Yes/No được coi là triệu chứng khi trả cho bác sĩ */
  symptomKeys: string[];
}

const YN: Field = { type: 'enum', values: ['Yes', 'No'] };
const GENDER: Field = { type: 'enum', values: ['Male', 'Female', 'Other'] };

export const INTAKE: Record<string, IntakeDef> = {
  oncology: {
    code: 'oncology',
    name: 'Ung bướu & Tai Mũi Họng',
    requiresImages: true,
    aiEnabled: true,
    imageKind: ImageKind.ENDOSCOPY,
    fields: {
      age: { type: 'int', min: 10, max: 80 },
      gender: GENDER,
      tobacco: YN,
      alcohol: YN,
      betelQuid: YN,
      hpv: YN,
      sunExposure: YN,
      oralHygiene: YN,
      familyHistory: YN,
      immune: YN,
      diet: { type: 'enum', values: ['Low', 'Moderate', 'High'] },
      lesions: YN,
      bleeding: YN,
      swallowing: YN,
      patches: YN,
    },
    symptomKeys: ['lesions', 'bleeding', 'swallowing', 'patches'],
  },
  nephrology: {
    code: 'nephrology',
    name: 'Thận học & Lọc máu',
    requiresImages: false,
    aiEnabled: false,
    imageKind: ImageKind.DOCUMENT,
    fields: {
      age: { type: 'int', min: 10, max: 110 },
      gender: GENDER,
      creatinine: { type: 'number', min: 0.1, max: 20 },
      systolic: { type: 'int', min: 60, max: 250 },
      diastolic: { type: 'int', min: 40, max: 150 },
      proteinuria: { type: 'enum', values: ['negative', 'trace', '1plus', '2plus', '3plus'] },
    },
    symptomKeys: [],
  },
  // cardiology: bổ sung khi có form khai báo tương ứng
};

export function validateIntake(def: IntakeDef, body: Record<string, unknown>): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  const errors: string[] = [];

  for (const [key, f] of Object.entries(def.fields)) {
    const raw = body[key];
    if (raw === undefined || raw === null || raw === '') {
      errors.push(`Thiếu trường "${key}"`);
      continue;
    }
    if (f.type === 'enum') {
      if (typeof raw === 'string' && f.values.includes(raw)) out[key] = raw;
      else errors.push(`Giá trị của "${key}" không hợp lệ`);
      continue;
    }
    const n = Number(raw);
    if (!Number.isFinite(n) || n < f.min || n > f.max || (f.type === 'int' && !Number.isInteger(n))) {
      errors.push(`"${key}" phải nằm trong khoảng ${f.min}–${f.max}`);
    } else {
      out[key] = n;
    }
  }

  if (errors.length) throw new BadRequestException(errors);
  return out;
}
