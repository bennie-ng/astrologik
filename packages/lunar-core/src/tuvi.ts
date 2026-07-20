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
import { napAm, type NapAm } from './nguhanh';

export type Gender = 'nam' | 'nu';

export interface TuViStar {
  name: string;
  kind: 'chinh' | 'phu';
  /** Tứ hóa attached to this star, if any */
  hoa?: 'Hóa Lộc' | 'Hóa Quyền' | 'Hóa Khoa' | 'Hóa Kỵ';
}

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
  /** "Dương Nam" | "Âm Nữ" … */
  amDuong: string;
  /** Cục, e.g. { name: "Hỏa lục cục", so: 6 } */
  cuc: { name: string; so: number; element: NapAm['element'] };
  /** Mệnh nạp âm (bản mệnh), e.g. "Hải Trung Kim" */
  banMenh: string;
  menhIndex: number;
  thanIndex: number;
  palaces: TuViPalace[]; // indexed by chi 0..11
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

/** Compute the full lá số tử vi. */
export function laSoTuVi(
  day: number,
  month: number,
  year: number,
  hourChi: number,
  gender: Gender,
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
    const c = mod12(chi);
    if (!stars.has(c)) stars.set(c, []);
    stars.get(c)!.push({ name, kind });
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
    const list = (stars.get(chi) ?? []).sort((a, b) =>
      a.kind === b.kind ? a.name.localeCompare(b.name, 'vi') : a.kind === 'chinh' ? -1 : 1,
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

  return {
    input: { day, month, year, hourChi: h, gender },
    lunar,
    yearCanChi: yCC.name,
    dayCanChi: dCC.name,
    hourName: `Giờ ${CHI[h]}`,
    amDuong,
    cuc: { name: cuc.name, so: cuc.so, element: menhNapAm.element },
    banMenh: napAm(yCC.canIndex, yCC.chiIndex).name,
    menhIndex: menh,
    thanIndex: than,
    palaces,
  };
}
