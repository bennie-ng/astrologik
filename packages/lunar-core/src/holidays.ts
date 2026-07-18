/** Vietnamese holidays and observances, solar and lunar. */

export interface Holiday {
  day: number;
  month: number;
  name: string;
  /** true for official public holidays (ngày nghỉ lễ) */
  publicHoliday?: boolean;
}

export const SOLAR_HOLIDAYS: Holiday[] = [
  { day: 1, month: 1, name: 'Tết Dương lịch', publicHoliday: true },
  { day: 3, month: 2, name: 'Thành lập Đảng CSVN' },
  { day: 27, month: 2, name: 'Ngày Thầy thuốc Việt Nam' },
  { day: 8, month: 3, name: 'Quốc tế Phụ nữ' },
  { day: 30, month: 4, name: 'Giải phóng miền Nam', publicHoliday: true },
  { day: 1, month: 5, name: 'Quốc tế Lao động', publicHoliday: true },
  { day: 19, month: 5, name: 'Sinh nhật Chủ tịch Hồ Chí Minh' },
  { day: 1, month: 6, name: 'Quốc tế Thiếu nhi' },
  { day: 27, month: 7, name: 'Thương binh Liệt sĩ' },
  { day: 2, month: 9, name: 'Quốc khánh', publicHoliday: true },
  { day: 10, month: 10, name: 'Giải phóng Thủ đô' },
  { day: 20, month: 10, name: 'Phụ nữ Việt Nam' },
  { day: 20, month: 11, name: 'Nhà giáo Việt Nam' },
  { day: 22, month: 12, name: 'Thành lập QĐND Việt Nam' },
  { day: 24, month: 12, name: 'Lễ Giáng sinh' },
];

export const LUNAR_HOLIDAYS: Holiday[] = [
  { day: 1, month: 1, name: 'Tết Nguyên Đán', publicHoliday: true },
  { day: 15, month: 1, name: 'Rằm tháng Giêng (Tết Nguyên Tiêu)' },
  { day: 3, month: 3, name: 'Tết Hàn thực' },
  { day: 10, month: 3, name: 'Giỗ Tổ Hùng Vương', publicHoliday: true },
  { day: 15, month: 4, name: 'Lễ Phật Đản' },
  { day: 5, month: 5, name: 'Tết Đoan Ngọ' },
  { day: 15, month: 7, name: 'Lễ Vu Lan (Rằm tháng Bảy)' },
  { day: 15, month: 8, name: 'Tết Trung Thu' },
  { day: 23, month: 12, name: 'Ông Táo chầu trời' },
];

/** Solar-calendar holidays falling on the given solar day/month. */
export function solarHolidays(day: number, month: number): Holiday[] {
  return SOLAR_HOLIDAYS.filter((h) => h.day === day && h.month === month);
}

/** Lunar-calendar holidays falling on the given lunar day/month (never in a leap month). */
export function lunarHolidays(day: number, month: number, leap: boolean): Holiday[] {
  if (leap) return [];
  return LUNAR_HOLIDAYS.filter((h) => h.day === day && h.month === month);
}
