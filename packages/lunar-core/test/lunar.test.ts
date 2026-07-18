import { describe, expect, it } from 'vitest';
import {
  auspiciousHours,
  dayCanChi,
  getDayInfo,
  jdFromDate,
  lunarMonthLength,
  lunarToSolar,
  napAm,
  sexagenaryIndex,
  solarTerm,
  solarToLunar,
  yearCanChi,
} from '../src';

describe('solarToLunar — Tết Nguyên Đán (1/1 ÂL) reference dates', () => {
  const tetDates: Array<[number, number, number, number]> = [
    // [solar year, solar month, solar day, lunar year]
    [2020, 1, 25, 2020],
    [2021, 2, 12, 2021],
    [2022, 2, 1, 2022],
    [2023, 1, 22, 2023],
    [2024, 2, 10, 2024],
    [2025, 1, 29, 2025],
    [2026, 2, 17, 2026],
    [2000, 2, 5, 2000],
    // Vietnam celebrated Tết Ất Sửu on 21/01/1985, one lunar month before
    // China — the classic UTC+7 vs UTC+8 divergence.
    [1985, 1, 21, 1985],
  ];

  it.each(tetDates)('%i-%i-%i is 1/1 lunar year %i', (y, m, d, lunarYear) => {
    const lunar = solarToLunar(d, m, y);
    expect(lunar).toMatchObject({ day: 1, month: 1, year: lunarYear, leap: false });
  });
});

describe('leap months (tháng nhuận)', () => {
  it('2023-03-22 is 1/2 nhuận Quý Mão', () => {
    expect(solarToLunar(22, 3, 2023)).toMatchObject({
      day: 1,
      month: 2,
      year: 2023,
      leap: true,
    });
  });

  it('2020-05-23 is 1/4 nhuận Canh Tý', () => {
    expect(solarToLunar(23, 5, 2020)).toMatchObject({
      day: 1,
      month: 4,
      year: 2020,
      leap: true,
    });
  });

  it('lunarToSolar rejects a leap month that does not exist', () => {
    expect(lunarToSolar(1, 3, 2023, true)).toBeNull();
    expect(lunarToSolar(1, 5, 2024, true)).toBeNull();
  });

  it('lunarToSolar handles the leap month correctly', () => {
    expect(lunarToSolar(1, 2, 2023, true)).toEqual({ day: 22, month: 3, year: 2023 });
    expect(lunarToSolar(1, 4, 2020, true)).toEqual({ day: 23, month: 5, year: 2020 });
  });
});

describe('round-trip solar → lunar → solar', () => {
  it('is the identity for every day from 1990 through 2049', () => {
    const start = jdFromDate(1, 1, 1990);
    const end = jdFromDate(31, 12, 2049);
    for (let jd = start; jd <= end; jd++) {
      // walk by JD to cover every day exactly once
      const { day, month, year } = jdToDateLocal(jd);
      const lunar = solarToLunar(day, month, year);
      expect(lunar.day).toBeGreaterThanOrEqual(1);
      expect(lunar.day).toBeLessThanOrEqual(30);
      expect(lunar.month).toBeGreaterThanOrEqual(1);
      expect(lunar.month).toBeLessThanOrEqual(12);
      const back = lunarToSolar(lunar.day, lunar.month, lunar.year, lunar.leap);
      expect(back).toEqual({ day, month, year });
    }
  });
});

// Local Gregorian JD→date helper for the loop above.
function jdToDateLocal(jd: number): { day: number; month: number; year: number } {
  const a = jd + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((b * 146097) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  return {
    day: e - Math.floor((153 * m + 2) / 5) + 1,
    month: m + 3 - 12 * Math.floor(m / 10),
    year: b * 100 + d - 4800 + Math.floor(m / 10),
  };
}

describe('can chi', () => {
  it('2000-01-01 is ngày Mậu Ngọ', () => {
    expect(dayCanChi(jdFromDate(1, 1, 2000)).name).toBe('Mậu Ngọ');
  });

  it('mùng 1 Tết 2024 (2024-02-10) is ngày Giáp Thìn', () => {
    expect(dayCanChi(jdFromDate(10, 2, 2024)).name).toBe('Giáp Thìn');
  });

  it('year can chi: 2024 Giáp Thìn, 2025 Ất Tỵ, 1975 Ất Mão', () => {
    expect(yearCanChi(2024).name).toBe('Giáp Thìn');
    expect(yearCanChi(2025).name).toBe('Ất Tỵ');
    expect(yearCanChi(1975).name).toBe('Ất Mão');
  });
});

describe('giờ hoàng đạo', () => {
  it('a Tý day has hours Tý, Sửu, Mão, Ngọ, Thân, Dậu', () => {
    expect(auspiciousHours(0).map((h) => h.chi)).toEqual([
      'Tý',
      'Sửu',
      'Mão',
      'Ngọ',
      'Thân',
      'Dậu',
    ]);
  });

  it('always returns exactly 6 hours', () => {
    for (let chi = 0; chi < 12; chi++) {
      expect(auspiciousHours(chi)).toHaveLength(6);
    }
  });
});

describe('tiết khí', () => {
  it('late March is Xuân phân, late June is Hạ chí, late December is Đông chí', () => {
    expect(solarTerm(jdFromDate(25, 3, 2024))).toBe('Xuân phân');
    expect(solarTerm(jdFromDate(25, 6, 2024))).toBe('Hạ chí');
    expect(solarTerm(jdFromDate(25, 12, 2024))).toBe('Đông chí');
  });
});

describe('lunarMonthLength', () => {
  it('is always 29 or 30', () => {
    for (let m = 1; m <= 12; m++) {
      const len = lunarMonthLength(m, 2024);
      expect([29, 30]).toContain(len);
    }
  });
});

describe('ngũ hành (nạp âm)', () => {
  it('maps well-known years correctly', () => {
    const yearNapAm = (y: number) => {
      const cc = yearCanChi(y);
      return napAm(cc.canIndex, cc.chiIndex);
    };
    expect(yearNapAm(1984)).toEqual({ name: 'Hải Trung Kim', element: 'Kim' }); // Giáp Tý
    expect(yearNapAm(1990)).toEqual({ name: 'Lộ Bàng Thổ', element: 'Thổ' }); // Canh Ngọ
    expect(yearNapAm(1996)).toEqual({ name: 'Giản Hạ Thủy', element: 'Thủy' }); // Bính Tý
    expect(yearNapAm(2000)).toEqual({ name: 'Bạch Lạp Kim', element: 'Kim' }); // Canh Thìn
    expect(yearNapAm(2024)).toEqual({ name: 'Phúc Đăng Hỏa', element: 'Hỏa' }); // Giáp Thìn
    expect(yearNapAm(2025)).toEqual({ name: 'Phúc Đăng Hỏa', element: 'Hỏa' }); // Ất Tỵ
  });

  it('computes the day element (2000-01-01 Mậu Ngọ → Thiên Thượng Hỏa)', () => {
    const cc = dayCanChi(jdFromDate(1, 1, 2000));
    expect(napAm(cc.canIndex, cc.chiIndex)).toEqual({
      name: 'Thiên Thượng Hỏa',
      element: 'Hỏa',
    });
  });

  it('sexagenaryIndex round-trips the full 60-cycle', () => {
    for (let n = 0; n < 60; n++) {
      expect(sexagenaryIndex(n % 10, n % 12)).toBe(n);
    }
    expect(() => sexagenaryIndex(0, 1)).toThrow(); // Giáp Sửu does not exist
  });
});

describe('getDayInfo', () => {
  it('aggregates a full day view for Tết 2025', () => {
    const info = getDayInfo(29, 1, 2025);
    expect(info.lunar).toMatchObject({ day: 1, month: 1, year: 2025 });
    expect(info.canChi.year.name).toBe('Ất Tỵ');
    expect(info.isMung1).toBe(true);
    expect(info.holidays.map((h) => h.name)).toContain('Tết Nguyên Đán');
    expect(info.auspiciousHours).toHaveLength(6);
  });

  it('flags Giỗ Tổ Hùng Vương (10/3 ÂL 2024 = 2024-04-18)', () => {
    const info = getDayInfo(18, 4, 2024);
    expect(info.lunar).toMatchObject({ day: 10, month: 3 });
    expect(info.holidays.map((h) => h.name)).toContain('Giỗ Tổ Hùng Vương');
  });
});
