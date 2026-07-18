/**
 * Ngũ hành (Five Elements) via nạp âm — the element assigned to each
 * can-chi pair of the sexagenary cycle. Consecutive pairs share one
 * nạp âm, so the 60 combinations map to 30 named elements.
 */

export type Element = 'Kim' | 'Mộc' | 'Thủy' | 'Hỏa' | 'Thổ';

export interface NapAm {
  /** Full nạp âm name, e.g. "Hải Trung Kim" */
  name: string;
  element: Element;
}

/** The 30 nạp âm, indexed by half the sexagenary index (Giáp Tý = 0). */
const NAP_AM: ReadonlyArray<readonly [string, Element]> = [
  ['Hải Trung Kim', 'Kim'],
  ['Lư Trung Hỏa', 'Hỏa'],
  ['Đại Lâm Mộc', 'Mộc'],
  ['Lộ Bàng Thổ', 'Thổ'],
  ['Kiếm Phong Kim', 'Kim'],
  ['Sơn Đầu Hỏa', 'Hỏa'],
  ['Giản Hạ Thủy', 'Thủy'],
  ['Thành Đầu Thổ', 'Thổ'],
  ['Bạch Lạp Kim', 'Kim'],
  ['Dương Liễu Mộc', 'Mộc'],
  ['Tuyền Trung Thủy', 'Thủy'],
  ['Ốc Thượng Thổ', 'Thổ'],
  ['Tích Lịch Hỏa', 'Hỏa'],
  ['Tùng Bách Mộc', 'Mộc'],
  ['Trường Lưu Thủy', 'Thủy'],
  ['Sa Trung Kim', 'Kim'],
  ['Sơn Hạ Hỏa', 'Hỏa'],
  ['Bình Địa Mộc', 'Mộc'],
  ['Bích Thượng Thổ', 'Thổ'],
  ['Kim Bạch Kim', 'Kim'],
  ['Phúc Đăng Hỏa', 'Hỏa'],
  ['Thiên Hà Thủy', 'Thủy'],
  ['Đại Trạch Thổ', 'Thổ'],
  ['Thoa Xuyến Kim', 'Kim'],
  ['Tang Đố Mộc', 'Mộc'],
  ['Đại Khê Thủy', 'Thủy'],
  ['Sa Trung Thổ', 'Thổ'],
  ['Thiên Thượng Hỏa', 'Hỏa'],
  ['Thạch Lựu Mộc', 'Mộc'],
  ['Đại Hải Thủy', 'Thủy'],
];

/**
 * Sexagenary cycle index (0 = Giáp Tý … 59 = Quý Hợi) from a can index
 * (0 = Giáp) and chi index (0 = Tý). Valid pairs have matching parity.
 */
export function sexagenaryIndex(canIndex: number, chiIndex: number): number {
  for (let k = 0; k < 6; k++) {
    const n = canIndex + 10 * k;
    if (n % 12 === chiIndex) return n;
  }
  throw new Error(`Invalid can-chi pair: can=${canIndex}, chi=${chiIndex}`);
}

/** Nạp âm (element) of a can-chi pair. */
export function napAm(canIndex: number, chiIndex: number): NapAm {
  const [name, element] = NAP_AM[Math.floor(sexagenaryIndex(canIndex, chiIndex) / 2)];
  return { name, element };
}
