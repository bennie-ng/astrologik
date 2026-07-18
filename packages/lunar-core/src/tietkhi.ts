/** Tiết khí (24 solar terms), derived from the sun's ecliptic longitude. */

import { VIETNAM_TZ, getSolarTermIndex } from './astronomy';

/** Names indexed from sun longitude 0° (Xuân phân), 15° per term. */
export const TIET_KHI = [
  'Xuân phân',
  'Thanh minh',
  'Cốc vũ',
  'Lập hạ',
  'Tiểu mãn',
  'Mang chủng',
  'Hạ chí',
  'Tiểu thử',
  'Đại thử',
  'Lập thu',
  'Xử thử',
  'Bạch lộ',
  'Thu phân',
  'Hàn lộ',
  'Sương giáng',
  'Lập đông',
  'Tiểu tuyết',
  'Đại tuyết',
  'Đông chí',
  'Tiểu hàn',
  'Đại hàn',
  'Lập xuân',
  'Vũ thủy',
  'Kinh trập',
] as const;

/** Name of the solar term in effect on the given day (by its JDN). */
export function solarTerm(jd: number, timeZone: number = VIETNAM_TZ): string {
  return TIET_KHI[getSolarTermIndex(jd + 1, timeZone)];
}
