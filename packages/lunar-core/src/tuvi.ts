/**
 * Lá số Tử Vi (Tử Vi Đẩu Số natal chart).
 *
 * Computes the 12-palace chart from a solar birth date, birth hour
 * (chi) and gender: an Mệnh/Thân, cục, the 14 major stars, the
 * essential minor stars, tứ hóa, vòng Tràng Sinh and đại vận.
 *
 * Chi indices are 0 = Tý … 11 = Hợi throughout.
 */

import { CAN, CHI, dayCanChi, yearCanChi } from './canchi';
import { solarToLunar, type LunarDate } from './lunar';
import { napAm, sexagenaryIndex, type NapAm } from './nguhanh';

export type Gender = 'nam' | 'nu';

export interface TuViStar {
  name: string;
  kind: 'chinh' | 'phu' | 'luu';
  /** Ngũ hành of the star */
  element: NapAm['element'];
  /** Cát tinh (good) or hung tinh (bad) */
  nature: 'cat' | 'hung';
  /** Tứ hóa attached to this star, if any */
  hoa?: 'Hóa Lộc' | 'Hóa Quyền' | 'Hóa Khoa' | 'Hóa Kỵ';
}

/**
 * Ngũ hành and cát/hung nature per star, following the classification
 * used by the reference lasotuvi implementation.
 */
const STAR_INFO: Record<string, [NapAm['element'], 'cat' | 'hung']> = {
  // 14 chính tinh
  'Tử Vi': ['Thổ', 'cat'],
  'Liêm Trinh': ['Hỏa', 'cat'],
  'Thiên Đồng': ['Thủy', 'cat'],
  'Vũ Khúc': ['Kim', 'cat'],
  'Thái Dương': ['Hỏa', 'cat'],
  'Thiên Cơ': ['Mộc', 'cat'],
  'Thiên Phủ': ['Thổ', 'cat'],
  'Thái Âm': ['Thủy', 'cat'],
  'Tham Lang': ['Thủy', 'cat'],
  'Cự Môn': ['Thủy', 'cat'],
  'Thiên Tướng': ['Thủy', 'cat'],
  'Thiên Lương': ['Mộc', 'cat'],
  'Thất Sát': ['Kim', 'cat'],
  'Phá Quân': ['Thủy', 'cat'],
  // Vòng Thái Tuế
  'Thái Tuế': ['Hỏa', 'hung'],
  'Thiếu Dương': ['Hỏa', 'cat'],
  'Tang Môn': ['Mộc', 'hung'],
  'Thiếu Âm': ['Thủy', 'cat'],
  'Quan Phù': ['Hỏa', 'hung'],
  'Tử Phù': ['Kim', 'hung'],
  'Tuế Phá': ['Hỏa', 'hung'],
  'Long Đức': ['Thủy', 'cat'],
  'Bạch Hổ': ['Kim', 'hung'],
  'Phúc Đức': ['Thổ', 'cat'],
  'Điếu Khách': ['Hỏa', 'hung'],
  'Trực Phù': ['Kim', 'hung'],
  // Lộc Tồn và vòng Bác Sĩ
  'Lộc Tồn': ['Thổ', 'cat'],
  'Bác Sĩ': ['Thủy', 'cat'],
  'Lực Sĩ': ['Hỏa', 'cat'],
  'Thanh Long': ['Thủy', 'cat'],
  'Tiểu Hao': ['Hỏa', 'hung'],
  'Tướng Quân': ['Mộc', 'cat'],
  'Tấu Thư': ['Kim', 'cat'],
  'Phi Liêm': ['Hỏa', 'cat'],
  'Hỷ Thần': ['Hỏa', 'cat'],
  'Bệnh Phù': ['Thổ', 'hung'],
  'Đại Hao': ['Hỏa', 'hung'],
  'Phục Binh': ['Hỏa', 'hung'],
  'Quan Phủ': ['Hỏa', 'hung'],
  // Lục sát và sát tinh
  'Kình Dương': ['Kim', 'hung'],
  'Đà La': ['Kim', 'hung'],
  'Địa Không': ['Hỏa', 'hung'],
  'Địa Kiếp': ['Hỏa', 'hung'],
  'Hỏa Tinh': ['Hỏa', 'hung'],
  'Linh Tinh': ['Hỏa', 'hung'],
  'Kiếp Sát': ['Hỏa', 'hung'],
  'Thiên Không': ['Hỏa', 'hung'],
  // Văn tinh, quý tinh
  'Văn Xương': ['Kim', 'cat'],
  'Văn Khúc': ['Thủy', 'cat'],
  'Thiên Khôi': ['Hỏa', 'cat'],
  'Thiên Việt': ['Hỏa', 'cat'],
  'Tả Phù': ['Thổ', 'cat'],
  'Hữu Bật': ['Thổ', 'cat'],
  'Long Trì': ['Thủy', 'cat'],
  'Phượng Các': ['Thổ', 'cat'],
  'Tam Thai': ['Mộc', 'cat'],
  'Bát Tọa': ['Thủy', 'cat'],
  'Ân Quang': ['Mộc', 'cat'],
  'Thiên Quý': ['Thổ', 'cat'],
  'Quốc Ấn': ['Thổ', 'cat'],
  'Đường Phù': ['Mộc', 'cat'],
  'Thai Phụ': ['Kim', 'cat'],
  'Phong Cáo': ['Thổ', 'cat'],
  'LN Văn Tinh': ['Hỏa', 'cat'],
  // Phúc thiện, đào hoa
  'Thiên Đức': ['Hỏa', 'cat'],
  'Nguyệt Đức': ['Hỏa', 'cat'],
  'Thiên Y': ['Thủy', 'cat'],
  'Thiên Giải': ['Hỏa', 'cat'],
  'Địa Giải': ['Thổ', 'cat'],
  'Giải Thần': ['Mộc', 'cat'],
  'Đào Hoa': ['Mộc', 'cat'],
  'Hồng Loan': ['Thủy', 'cat'],
  'Thiên Hỷ': ['Thủy', 'cat'],
  'Thiên Quan': ['Hỏa', 'cat'],
  'Thiên Phúc': ['Hỏa', 'cat'],
  'Thiên Trù': ['Thổ', 'cat'],
  'Thiên Mã': ['Hỏa', 'cat'],
  'Thiên Tài': ['Thổ', 'cat'],
  'Thiên Thọ': ['Thổ', 'cat'],
  'Hoa Cái': ['Kim', 'cat'],
  'Đẩu Quân': ['Hỏa', 'cat'],
  // Hung, bại, ám tinh
  'Thiên Khốc': ['Thủy', 'hung'],
  'Thiên Hư': ['Thủy', 'hung'],
  'Thiên Hình': ['Hỏa', 'hung'],
  'Thiên Riêu': ['Thủy', 'hung'],
  'Cô Thần': ['Thổ', 'hung'],
  'Quả Tú': ['Thổ', 'hung'],
  'Phá Toái': ['Hỏa', 'hung'],
  'Lưu Hà': ['Thủy', 'hung'],
  'Thiên Thương': ['Thổ', 'hung'],
  'Thiên Sứ': ['Thủy', 'hung'],
  'Thiên La': ['Thổ', 'hung'],
  'Địa Võng': ['Thổ', 'hung'],
};

export interface TuViPalace {
  chiIndex: number;
  /** Can-chi of the palace, e.g. "Bính Dần" */
  canChi: string;
  /** Palace role, e.g. "Mệnh", "Tài Bạch" */
  cung: string;
  /** True if Thân resides here */
  than: boolean;
  stars: TuViStar[];
  /** Vòng Tràng Sinh station of this palace */
  trangSinh: string;
  /** Starting age of this palace's đại vận (10-year period) */
  daiVan: number;
}

export interface TuViChart {
  input: { day: number; month: number; year: number; hourChi: number; gender: Gender };
  lunar: LunarDate;
  /** Can chi of birth year / month-in-effect / day */
  yearCanChi: string;
  dayCanChi: string;
  hourName: string;
  /** Can chi of the birth hour (ngũ thử độn), e.g. "Canh Tuất" */
  hourCanChi: string;
  /** Chủ mệnh star (by year chi) */
  menhChu: string;
  /** Chủ thân star (by year chi) */
  thanChu: string;
  /** Sinh/khắc relation between bản mệnh and cục, e.g. "Mệnh Mộc khắc Cục Thổ" */
  cucRelation: string;
  /** "Dương Nam" | "Âm Nữ" … */
  amDuong: string;
  /** Cục, e.g. { name: "Hỏa lục cục", so: 6 } */
  cuc: { name: string; so: number; element: NapAm['element'] };
  /** Mệnh nạp âm (bản mệnh), e.g. "Hải Trung Kim" */
  banMenh: string;
  menhIndex: number;
  thanIndex: number;
  /** Tuần Trung Không Vong — the two palace chi it covers */
  tuan: [number, number];
  /** Triệt Lộ Không Vong — the two palace chi it covers */
  triet: [number, number];
  /** The viewing year for lưu niên stars, if requested */
  namXem?: { year: number; canChi: string; tuoi: number };
  palaces: TuViPalace[]; // indexed by chi 0..11
}

/** Lưu Văn Khúc by year-can index (mirror of the Văn Xương table). */
const LUU_VAN_KHUC = [9, 8, 6, 5, 6, 5, 3, 2, 0, 11];

/** Element/nature of the standalone tứ hóa entries. */
const HOA_INFO: Record<string, [NapAm['element'], 'cat' | 'hung']> = {
  'Hóa Lộc': ['Mộc', 'cat'],
  'Hóa Quyền': ['Thủy', 'cat'],
  'Hóa Khoa': ['Thủy', 'cat'],
  'Hóa Kỵ': ['Thủy', 'hung'],
};

/** Chủ mệnh star by year-chi index. */
const MENH_CHU = [
  'Tham Lang',
  'Cự Môn',
  'Lộc Tồn',
  'Văn Khúc',
  'Liêm Trinh',
  'Vũ Khúc',
  'Phá Quân',
  'Vũ Khúc',
  'Liêm Trinh',
  'Văn Khúc',
  'Lộc Tồn',
  'Cự Môn',
];

/** Chủ thân star by year-chi index. */
const THAN_CHU = [
  'Linh Tinh',
  'Thiên Tướng',
  'Thiên Lương',
  'Thiên Đồng',
  'Văn Xương',
  'Thiên Cơ',
  'Hỏa Tinh',
  'Thiên Tướng',
  'Thiên Lương',
  'Thiên Đồng',
  'Văn Xương',
  'Thiên Cơ',
];

/** Ngũ hành sinh/khắc cycles. */
const SINH: Record<NapAm['element'], NapAm['element']> = {
  Mộc: 'Hỏa',
  Hỏa: 'Thổ',
  Thổ: 'Kim',
  Kim: 'Thủy',
  Thủy: 'Mộc',
};
const KHAC: Record<NapAm['element'], NapAm['element']> = {
  Mộc: 'Thổ',
  Thổ: 'Thủy',
  Thủy: 'Hỏa',
  Hỏa: 'Kim',
  Kim: 'Mộc',
};

function menhCucRelation(menh: NapAm['element'], cuc: NapAm['element']): string {
  if (menh === cuc) return 'Mệnh Cục tương hòa';
  if (KHAC[menh] === cuc) return `Mệnh ${menh} khắc Cục ${cuc}`;
  if (KHAC[cuc] === menh) return `Cục ${cuc} khắc Mệnh ${menh}`;
  if (SINH[menh] === cuc) return `Mệnh ${menh} sinh Cục ${cuc}`;
  return `Cục ${cuc} sinh Mệnh ${menh}`;
}

const CUNG_NAMES = [
  'Mệnh',
  'Phụ Mẫu',
  'Phúc Đức',
  'Điền Trạch',
  'Quan Lộc',
  'Nô Bộc',
  'Thiên Di',
  'Tật Ách',
  'Tài Bạch',
  'Tử Tức',
  'Phu Thê',
  'Huynh Đệ',
];

const TRANG_SINH = [
  'Tràng Sinh',
  'Mộc Dục',
  'Quan Đới',
  'Lâm Quan',
  'Đế Vượng',
  'Suy',
  'Bệnh',
  'Tử',
  'Mộ',
  'Tuyệt',
  'Thai',
  'Dưỡng',
];

const CUC_BY_ELEMENT: Record<NapAm['element'], { name: string; so: number; sinh: number }> = {
  // sinh = vị trí Tràng Sinh của cục
  Thủy: { name: 'Thủy nhị cục', so: 2, sinh: 8 },
  Mộc: { name: 'Mộc tam cục', so: 3, sinh: 11 },
  Kim: { name: 'Kim tứ cục', so: 4, sinh: 5 },
  Thổ: { name: 'Thổ ngũ cục', so: 5, sinh: 8 },
  Hỏa: { name: 'Hỏa lục cục', so: 6, sinh: 2 },
};

/** Lộc Tồn position by year-can index. */
const LOC_TON = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0];

/** [Thiên Khôi, Thiên Việt] by year-can index. */
const KHOI_VIET: ReadonlyArray<readonly [number, number]> = [
  [1, 7], // Giáp
  [0, 8], // Ất
  [11, 9], // Bính
  [11, 9], // Đinh
  [1, 7], // Mậu
  [0, 8], // Kỷ
  [1, 7], // Canh
  [6, 2], // Tân
  [3, 5], // Nhâm
  [3, 5], // Quý
];

/** Tứ hóa (Lộc, Quyền, Khoa, Kỵ) star names by year-can index. */
const TU_HOA: ReadonlyArray<readonly [string, string, string, string]> = [
  ['Liêm Trinh', 'Phá Quân', 'Vũ Khúc', 'Thái Dương'], // Giáp
  ['Thiên Cơ', 'Thiên Lương', 'Tử Vi', 'Thái Âm'], // Ất
  ['Thiên Đồng', 'Thiên Cơ', 'Văn Xương', 'Liêm Trinh'], // Bính
  ['Thái Âm', 'Thiên Đồng', 'Thiên Cơ', 'Cự Môn'], // Đinh
  ['Tham Lang', 'Thái Âm', 'Hữu Bật', 'Thiên Cơ'], // Mậu
  ['Vũ Khúc', 'Tham Lang', 'Thiên Lương', 'Văn Khúc'], // Kỷ
  ['Thái Dương', 'Vũ Khúc', 'Thái Âm', 'Thiên Đồng'], // Canh
  ['Cự Môn', 'Thái Dương', 'Văn Khúc', 'Văn Xương'], // Tân
  ['Thiên Lương', 'Tử Vi', 'Thiên Phủ', 'Vũ Khúc'], // Nhâm
  ['Phá Quân', 'Cự Môn', 'Thái Âm', 'Tham Lang'], // Quý
];

/** Year-chi triads → [Hỏa Tinh start, Linh Tinh start, Thiên Mã, Đào Hoa, Hoa Cái, Kiếp Sát]. */
function chiGroup(yearChi: number): {
  hoa: number;
  linh: number;
  ma: number;
  dao: number;
  cai: number;
  kiepSat: number;
} {
  if ([8, 0, 4].includes(yearChi))
    return { hoa: 2, linh: 10, ma: 2, dao: 9, cai: 4, kiepSat: 5 }; // Thân Tý Thìn
  if ([2, 6, 10].includes(yearChi))
    return { hoa: 1, linh: 3, ma: 8, dao: 3, cai: 10, kiepSat: 11 }; // Dần Ngọ Tuất
  if ([5, 9, 1].includes(yearChi))
    return { hoa: 3, linh: 10, ma: 11, dao: 6, cai: 1, kiepSat: 2 }; // Tỵ Dậu Sửu
  return { hoa: 9, linh: 10, ma: 5, dao: 0, cai: 7, kiepSat: 8 }; // Hợi Mão Mùi
}

/** Cô Thần / Quả Tú by year-chi season group. */
function coQua(yearChi: number): [number, number] {
  if ([2, 3, 4].includes(yearChi)) return [5, 1]; // Dần Mão Thìn → Tỵ / Sửu
  if ([5, 6, 7].includes(yearChi)) return [8, 4]; // Tỵ Ngọ Mùi → Thân / Thìn
  if ([8, 9, 10].includes(yearChi)) return [11, 7]; // Thân Dậu Tuất → Hợi / Mùi
  return [2, 10]; // Hợi Tý Sửu → Dần / Tuất
}

/** Lưu Hà by year-can index. */
const LUU_HA = [9, 10, 7, 8, 5, 6, 4, 3, 11, 2];
/** Lưu Niên Văn Tinh by year-can index. */
const LN_VAN_TINH = [5, 6, 8, 9, 8, 9, 11, 0, 2, 3];
/** Triệt Lộ Không Vong pair by year-can index % 5. */
const TRIET: ReadonlyArray<readonly [number, number]> = [
  [8, 9], // Giáp, Kỷ → Thân Dậu
  [6, 7], // Ất, Canh → Ngọ Mùi
  [4, 5], // Bính, Tân → Thìn Tỵ
  [2, 3], // Đinh, Nhâm → Dần Mão
  [0, 1], // Mậu, Quý → Tý Sửu
];
/** Thiên Trù by year-can index. */
const THIEN_TRU = [5, 6, 0, 5, 6, 8, 2, 6, 9, 10];
/** Thiên Quan quý nhân by year-can index. */
const THIEN_QUAN = [7, 4, 5, 2, 3, 9, 11, 9, 10, 6];
/** Thiên Phúc quý nhân by year-can index. */
const THIEN_PHUC = [9, 8, 0, 11, 3, 2, 6, 5, 6, 5];

/** Vòng Thái Tuế, thuận từ Thái Tuế (chi năm). */
const VONG_THAI_TUE = [
  'Thái Tuế',
  'Thiếu Dương',
  'Tang Môn',
  'Thiếu Âm',
  'Quan Phù',
  'Tử Phù',
  'Tuế Phá',
  'Long Đức',
  'Bạch Hổ',
  'Phúc Đức',
  'Điếu Khách',
  'Trực Phù',
];

/** Vòng Bác Sĩ, khởi từ Lộc Tồn, thuận với dương nam/âm nữ. */
const VONG_BAC_SI = [
  'Bác Sĩ',
  'Lực Sĩ',
  'Thanh Long',
  'Tiểu Hao',
  'Tướng Quân',
  'Tấu Thư',
  'Phi Liêm',
  'Hỷ Thần',
  'Bệnh Phù',
  'Đại Hao',
  'Phục Binh',
  'Quan Phủ',
];

const mod12 = (n: number) => ((n % 12) + 12) % 12;

/** Vị trí sao Tử Vi theo cục và ngày âm lịch. */
export function tuViPosition(cucSo: number, lunarDay: number): number {
  const q = Math.ceil(lunarDay / cucSo);
  const r = q * cucSo - lunarDay;
  return mod12(r % 2 === 0 ? 2 + (q - 1) + r : 2 + (q - 1) - r);
}

/** Compute the full lá số tử vi. Pass `namXem` to place lưu niên stars. */
export function laSoTuVi(
  day: number,
  month: number,
  year: number,
  hourChi: number,
  gender: Gender,
  namXem?: number,
): TuViChart {
  const lunar = solarToLunar(day, month, year);
  const yCC = yearCanChi(lunar.year);
  const dCC = dayCanChi(lunar.jd);

  // Tháng nhuận: nửa đầu tính tháng đó, nửa sau tính tháng sau.
  let m = lunar.month;
  if (lunar.leap && lunar.day > 15) {
    m = (m % 12) + 1;
  }
  const h = mod12(hourChi);

  const menh = mod12(2 + (m - 1) - h);
  const than = mod12(2 + (m - 1) + h);

  // Can of each palace via ngũ hổ độn (can of the Dần palace from year can).
  const canDan = ((yCC.canIndex % 5) * 2 + 2) % 10;
  const palaceCan = (chi: number) => (canDan + mod12(chi - 2)) % 10;

  // Cục from the nạp âm of the Mệnh palace's can-chi.
  const menhNapAm = napAm(palaceCan(menh), menh);
  const cuc = CUC_BY_ELEMENT[menhNapAm.element];

  // Âm dương: can chẵn (Giáp, Bính…) = dương.
  const duong = yCC.canIndex % 2 === 0;
  const amDuong = `${duong ? 'Dương' : 'Âm'} ${gender === 'nam' ? 'Nam' : 'Nữ'}`;
  const thuan = (duong && gender === 'nam') || (!duong && gender === 'nu');

  // Star placement.
  const stars = new Map<number, TuViStar[]>();
  const put = (chi: number, name: string, kind: TuViStar['kind']) => {
    const info = STAR_INFO[name];
    if (!info) throw new Error(`Missing STAR_INFO for ${name}`);
    const c = mod12(chi);
    if (!stars.has(c)) stars.set(c, []);
    stars.get(c)!.push({ name, kind, element: info[0], nature: info[1] });
  };

  const tv = tuViPosition(cuc.so, lunar.day);
  put(tv, 'Tử Vi', 'chinh');
  put(tv - 1, 'Thiên Cơ', 'chinh');
  put(tv - 3, 'Thái Dương', 'chinh');
  put(tv - 4, 'Vũ Khúc', 'chinh');
  put(tv - 5, 'Thiên Đồng', 'chinh');
  put(tv - 8, 'Liêm Trinh', 'chinh');

  const tp = mod12(4 - tv);
  put(tp, 'Thiên Phủ', 'chinh');
  put(tp + 1, 'Thái Âm', 'chinh');
  put(tp + 2, 'Tham Lang', 'chinh');
  put(tp + 3, 'Cự Môn', 'chinh');
  put(tp + 4, 'Thiên Tướng', 'chinh');
  put(tp + 5, 'Thiên Lương', 'chinh');
  put(tp + 6, 'Thất Sát', 'chinh');
  put(tp + 10, 'Phá Quân', 'chinh');

  const lt = LOC_TON[yCC.canIndex];
  put(lt, 'Lộc Tồn', 'phu');
  put(lt + 1, 'Kình Dương', 'phu');
  put(lt - 1, 'Đà La', 'phu');

  put(10 - h, 'Văn Xương', 'phu');
  put(4 + h, 'Văn Khúc', 'phu');
  put(4 + (m - 1), 'Tả Phù', 'phu');
  put(10 - (m - 1), 'Hữu Bật', 'phu');

  const [khoi, viet] = KHOI_VIET[yCC.canIndex];
  put(khoi, 'Thiên Khôi', 'phu');
  put(viet, 'Thiên Việt', 'phu');

  put(11 - h, 'Địa Không', 'phu');
  put(11 + h, 'Địa Kiếp', 'phu');

  const grp = chiGroup(yCC.chiIndex);
  put(grp.hoa + h, 'Hỏa Tinh', 'phu');
  put(grp.linh + h, 'Linh Tinh', 'phu');
  put(grp.ma, 'Thiên Mã', 'phu');
  put(grp.dao, 'Đào Hoa', 'phu');
  put(grp.cai, 'Hoa Cái', 'phu');
  put(grp.kiepSat, 'Kiếp Sát', 'phu');
  const hongLoan = mod12(3 - yCC.chiIndex);
  put(hongLoan, 'Hồng Loan', 'phu');
  put(hongLoan + 6, 'Thiên Hỷ', 'phu');

  // Theo can năm.
  put(LUU_HA[yCC.canIndex], 'Lưu Hà', 'phu');
  put(THIEN_TRU[yCC.canIndex], 'Thiên Trù', 'phu');
  put(THIEN_QUAN[yCC.canIndex], 'Thiên Quan', 'phu');
  put(THIEN_PHUC[yCC.canIndex], 'Thiên Phúc', 'phu');
  put(lt + 8, 'Quốc Ấn', 'phu');
  put(lt - 7, 'Đường Phù', 'phu');

  // Theo chi năm.
  const yc = yCC.chiIndex;
  put(4 + yc, 'Long Trì', 'phu');
  put(10 - yc, 'Phượng Các', 'phu');
  put(10 - yc, 'Giải Thần', 'phu');
  put(6 - yc, 'Thiên Khốc', 'phu');
  put(6 + yc, 'Thiên Hư', 'phu');
  put(9 + yc, 'Thiên Đức', 'phu');
  put(5 + yc, 'Nguyệt Đức', 'phu');
  put(yc + 1, 'Thiên Không', 'phu');
  const [coThan, quaTu] = coQua(yc);
  put(coThan, 'Cô Thần', 'phu');
  put(quaTu, 'Quả Tú', 'phu');
  put([5, 1, 9][yc % 3], 'Phá Toái', 'phu');
  VONG_THAI_TUE.forEach((name, i) => put(yc + i, name, 'phu'));

  // Theo tháng.
  put(9 + (m - 1), 'Thiên Hình', 'phu');
  put(1 + (m - 1), 'Thiên Riêu', 'phu');
  put(1 + (m - 1), 'Thiên Y', 'phu');
  put(8 + (m - 1), 'Thiên Giải', 'phu');
  put(7 + (m - 1), 'Địa Giải', 'phu');

  // Theo giờ.
  put(4 + h + 2, 'Thai Phụ', 'phu');
  put(4 + h - 2, 'Phong Cáo', 'phu');

  // Theo ngày (từ Tả/Hữu, Xương/Khúc).
  const d = lunar.day;
  put(4 + (m - 1) + (d - 1), 'Tam Thai', 'phu');
  put(10 - (m - 1) - (d - 1), 'Bát Tọa', 'phu');
  put(10 - h + (d - 1) - 1, 'Ân Quang', 'phu');
  put(4 + h - (d - 1) + 1, 'Thiên Quý', 'phu');

  // Theo Mệnh/Thân và chi năm.
  put(menh + yc, 'Thiên Tài', 'phu');
  put(than + yc, 'Thiên Thọ', 'phu');
  put(yc - (m - 1) + h, 'Đẩu Quân', 'phu');

  // Vòng Bác Sĩ khởi từ Lộc Tồn, thuận nếu dương nam/âm nữ.
  VONG_BAC_SI.forEach((name, i) => put(thuan ? lt + i : lt - i, name, 'phu'));

  // Thiên Thương tại Nô Bộc, Thiên Sứ tại Tật Ách.
  put(menh + 5, 'Thiên Thương', 'phu');
  put(menh + 7, 'Thiên Sứ', 'phu');

  // Cố định và theo can năm.
  put(4, 'Thiên La', 'phu');
  put(10, 'Địa Võng', 'phu');
  put(LN_VAN_TINH[yCC.canIndex], 'LN Văn Tinh', 'phu');

  // Tuần: hai chi còn trống của tuần giáp chứa năm sinh.
  const decadeStartChi = (sexagenaryIndex(yCC.canIndex, yCC.chiIndex) -
    (sexagenaryIndex(yCC.canIndex, yCC.chiIndex) % 10)) % 12;
  const tuan: [number, number] = [mod12(decadeStartChi + 10), mod12(decadeStartChi + 11)];
  const triet = TRIET[yCC.canIndex % 5] as [number, number];

  // Lưu niên: sao theo can/chi của năm xem (đặt sau các sao gốc).
  let namXemInfo: TuViChart['namXem'];
  if (namXem !== undefined) {
    const yx = yearCanChi(namXem);
    namXemInfo = { year: namXem, canChi: yx.name, tuoi: namXem - lunar.year + 1 };
    const putLuu = (chi: number, base: string) => {
      const info = STAR_INFO[base] ?? HOA_INFO[base];
      const c = mod12(chi);
      if (!stars.has(c)) stars.set(c, []);
      stars.get(c)!.push({ name: `L.${base}`, kind: 'luu', element: info[0], nature: info[1] });
    };
    const lc = yx.canIndex;
    const lchi = yx.chiIndex;
    const llt = LOC_TON[lc];
    putLuu(llt, 'Lộc Tồn');
    putLuu(llt + 1, 'Kình Dương');
    putLuu(llt - 1, 'Đà La');
    putLuu(LN_VAN_TINH[lc], 'Văn Xương');
    putLuu(LUU_VAN_KHUC[lc], 'Văn Khúc');
    const [lkhoi, lviet] = KHOI_VIET[lc];
    putLuu(lkhoi, 'Thiên Khôi');
    putLuu(lviet, 'Thiên Việt');
    putLuu(lchi, 'Thái Tuế');
    putLuu(lchi + 2, 'Tang Môn');
    putLuu(lchi + 8, 'Bạch Hổ');
    putLuu(6 - lchi, 'Thiên Khốc');
    putLuu(6 + lchi, 'Thiên Hư');
    putLuu(3 - lchi, 'Hồng Loan');
    const lgrp = chiGroup(lchi);
    putLuu(lgrp.ma, 'Thiên Mã');
    putLuu(lgrp.dao, 'Đào Hoa');
    putLuu(lgrp.kiepSat, 'Kiếp Sát');
    // Lưu tứ hóa: đặt tại cung của sao được hóa (theo vị trí an gốc).
    const HOA_LABELS_LUU = ['Hóa Lộc', 'Hóa Quyền', 'Hóa Khoa', 'Hóa Kỵ'] as const;
    TU_HOA[lc].forEach((starName, i) => {
      for (const [chi, list] of stars.entries()) {
        if (list.some((x) => x.kind !== 'luu' && x.name === starName)) {
          putLuu(chi, HOA_LABELS_LUU[i]);
          return;
        }
      }
    });
  }

  // Tứ hóa: attach to the star wherever it sits.
  const [hLoc, hQuyen, hKhoa, hKy] = TU_HOA[yCC.canIndex];
  const HOA_LABELS = ['Hóa Lộc', 'Hóa Quyền', 'Hóa Khoa', 'Hóa Kỵ'] as const;
  [hLoc, hQuyen, hKhoa, hKy].forEach((starName, i) => {
    for (const list of stars.values()) {
      const st = list.find((x) => x.name === starName);
      if (st) {
        st.hoa = HOA_LABELS[i];
        return;
      }
    }
  });

  // Palaces.
  const palaces: TuViPalace[] = [];
  for (let chi = 0; chi < 12; chi++) {
    const offset = mod12(chi - menh);
    const tsSteps = thuan ? mod12(chi - cuc.sinh) : mod12(cuc.sinh - chi);
    const dvSteps = thuan ? offset : mod12(menh - chi);
    const KIND_ORDER = { chinh: 0, phu: 1, luu: 2 } as const;
    const list = (stars.get(chi) ?? []).sort((a, b) =>
      a.kind === b.kind
        ? a.name.localeCompare(b.name, 'vi')
        : KIND_ORDER[a.kind] - KIND_ORDER[b.kind],
    );
    palaces.push({
      chiIndex: chi,
      canChi: `${CAN[palaceCan(chi)]} ${CHI[chi]}`,
      cung: CUNG_NAMES[offset],
      than: chi === than,
      stars: list,
      trangSinh: TRANG_SINH[tsSteps],
      daiVan: cuc.so + dvSteps * 10,
    });
  }

  // Can of the birth hour via ngũ thử độn (day can → can of giờ Tý).
  const hourCan = ((dCC.canIndex % 5) * 2 + h) % 10;
  const banMenhNapAm = napAm(yCC.canIndex, yCC.chiIndex);

  return {
    input: { day, month, year, hourChi: h, gender },
    lunar,
    yearCanChi: yCC.name,
    dayCanChi: dCC.name,
    hourName: `Giờ ${CHI[h]}`,
    hourCanChi: `${CAN[hourCan]} ${CHI[h]}`,
    menhChu: MENH_CHU[yCC.chiIndex],
    thanChu: THAN_CHU[yCC.chiIndex],
    cucRelation: menhCucRelation(banMenhNapAm.element, menhNapAm.element),
    amDuong,
    cuc: { name: cuc.name, so: cuc.so, element: menhNapAm.element },
    banMenh: napAm(yCC.canIndex, yCC.chiIndex).name,
    menhIndex: menh,
    thanIndex: than,
    tuan,
    triet,
    namXem: namXemInfo,
    palaces,
  };
}
