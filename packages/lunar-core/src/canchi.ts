/** Can Chi (Thiên can – Địa chi / sexagenary cycle) calculations. */

import type { LunarDate } from './lunar';

export const CAN = [
  'Giáp',
  'Ất',
  'Bính',
  'Đinh',
  'Mậu',
  'Kỷ',
  'Canh',
  'Tân',
  'Nhâm',
  'Quý',
] as const;

export const CHI = [
  'Tý',
  'Sửu',
  'Dần',
  'Mão',
  'Thìn',
  'Tỵ',
  'Ngọ',
  'Mùi',
  'Thân',
  'Dậu',
  'Tuất',
  'Hợi',
] as const;

export const CHI_ANIMALS = [
  'Chuột',
  'Trâu',
  'Hổ',
  'Mèo',
  'Rồng',
  'Rắn',
  'Ngựa',
  'Dê',
  'Khỉ',
  'Gà',
  'Chó',
  'Lợn',
] as const;

export interface CanChi {
  can: string;
  chi: string;
  canIndex: number;
  chiIndex: number;
  name: string;
}

function canChi(canIndex: number, chiIndex: number): CanChi {
  return {
    can: CAN[canIndex],
    chi: CHI[chiIndex],
    canIndex,
    chiIndex,
    name: `${CAN[canIndex]} ${CHI[chiIndex]}`,
  };
}

/** Can chi of a lunar year, e.g. 2024 → Giáp Thìn. */
export function yearCanChi(lunarYear: number): CanChi {
  return canChi(((lunarYear + 6) % 10 + 10) % 10, ((lunarYear + 8) % 12 + 12) % 12);
}

/**
 * Can chi of a lunar month. Tháng Giêng is always Dần; a leap month shares
 * the can chi of the month it follows.
 */
export function monthCanChi(lunarMonth: number, lunarYear: number): CanChi {
  return canChi((lunarYear * 12 + lunarMonth + 3) % 10, (lunarMonth + 1) % 12);
}

/** Can chi of a day, from its Julian day number. */
export function dayCanChi(jd: number): CanChi {
  return canChi((jd + 9) % 10, (jd + 1) % 12);
}

/**
 * Can chi of the Tý hour (23:00–01:00) opening the given day; the "canh giờ"
 * of the other hours follow in sequence from it.
 */
export function firstHourCanChi(jd: number): CanChi {
  return canChi(((jd - 1) * 2) % 10, 0);
}

/** Full can chi description of a solar day + its lunar date. */
export function fullCanChi(lunar: LunarDate): {
  day: CanChi;
  month: CanChi;
  year: CanChi;
} {
  return {
    day: dayCanChi(lunar.jd),
    month: monthCanChi(lunar.month, lunar.year),
    year: yearCanChi(lunar.year),
  };
}
