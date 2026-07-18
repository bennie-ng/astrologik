/**
 * Giờ hoàng đạo (auspicious hours) and ngày hoàng đạo / hắc đạo
 * (auspicious / inauspicious days), by the classical Thanh Long cycle.
 */

import { CHI } from './canchi';

/**
 * The 12-star cycle. Bit i of PATTERN marks whether star i is a hoàng đạo
 * (auspicious) star: Thanh Long, Minh Đường, Kim Quỹ, Bảo Quang (Kim Đường),
 * Ngọc Đường, Tư Mệnh are auspicious; the other six are hắc đạo.
 */
const STARS = [
  'Thanh Long',
  'Minh Đường',
  'Thiên Hình',
  'Chu Tước',
  'Kim Quỹ',
  'Bảo Quang',
  'Bạch Hổ',
  'Ngọc Đường',
  'Thiên Lao',
  'Huyền Vũ',
  'Tư Mệnh',
  'Câu Trận',
] as const;

const PATTERN = '110011010010';

/** Hour ranges of the 12 chi hours, starting from Tý = 23:00–01:00. */
export const HOUR_RANGES = [
  '23:00-00:59',
  '01:00-02:59',
  '03:00-04:59',
  '05:00-06:59',
  '07:00-08:59',
  '09:00-10:59',
  '11:00-12:59',
  '13:00-14:59',
  '15:00-16:59',
  '17:00-18:59',
  '19:00-20:59',
  '21:00-22:59',
] as const;

export interface AuspiciousHour {
  chi: string;
  chiIndex: number;
  range: string;
}

/**
 * Hoàng đạo hour bitmaps by day chi (index = chi % 6, bit 0 = giờ Tý),
 * per the classical table (Tý/Ngọ, Sửu/Mùi, … day pairs share hours).
 */
const GIO_HD = [
  '110100101100',
  '001101001011',
  '110011010010',
  '101100110100',
  '001011001101',
  '010010110011',
] as const;

/** Giờ hoàng đạo of a day, given the day's chi index (0 = Tý). */
export function auspiciousHours(dayChiIndex: number): AuspiciousHour[] {
  const bitmap = GIO_HD[((dayChiIndex % 6) + 6) % 6];
  const result: AuspiciousHour[] = [];
  for (let h = 0; h < 12; h++) {
    if (bitmap[h] === '1') {
      result.push({ chi: CHI[h], chiIndex: h, range: HOUR_RANGES[h] });
    }
  }
  return result;
}

export interface DayStar {
  star: string;
  auspicious: boolean;
}

/**
 * Ngày hoàng đạo / hắc đạo: the day's star in the Thanh Long cycle, which is
 * anchored to the lunar month (tháng Giêng: Thanh Long at Tý; each following
 * month shifts the anchor by two chi). Leap months use the same anchor as the
 * month they follow.
 */
export function dayStar(lunarMonth: number, dayChiIndex: number): DayStar {
  const starIndex = (dayChiIndex - (lunarMonth - 1) * 2 + 24) % 12;
  return { star: STARS[starIndex], auspicious: PATTERN[starIndex] === '1' };
}
