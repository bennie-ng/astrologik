/**
 * Solar ↔ lunar date conversion for the Vietnamese calendar
 * (thuật toán Hồ Ngọc Đức, computed at UTC+7).
 */

import {
  INT,
  VIETNAM_TZ,
  getNewMoonDay,
  getSunLongitudeIndex,
  jdFromDate,
  jdToDate,
} from './astronomy';

export interface LunarDate {
  day: number;
  month: number;
  year: number;
  /** true if this is the leap month (tháng nhuận) */
  leap: boolean;
  /** Julian day number of the solar day */
  jd: number;
}

export interface SolarDate {
  day: number;
  month: number;
  year: number;
}

/**
 * Day (local JDN) of the new moon starting lunar month 11 of the given year —
 * the month containing Đông chí (winter solstice), the anchor of the calendar.
 */
export function getLunarMonth11(yy: number, timeZone: number): number {
  const off = jdFromDate(31, 12, yy) - 2415021;
  const k = INT(off / 29.530588853);
  let nm = getNewMoonDay(k, timeZone);
  const sunLong = getSunLongitudeIndex(nm, timeZone);
  if (sunLong >= 9) {
    nm = getNewMoonDay(k - 1, timeZone);
  }
  return nm;
}

/**
 * Offset (in months after month 11) of the leap month in a lunar year that
 * starts with the month-11 new moon `a11`. Returns i such that month (k+i)
 * is the first month without a major solar term.
 */
export function getLeapMonthOffset(a11: number, timeZone: number): number {
  const k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last: number;
  let i = 1;
  let arc = getSunLongitudeIndex(getNewMoonDay(k + i, timeZone), timeZone);
  do {
    last = arc;
    i++;
    arc = getSunLongitudeIndex(getNewMoonDay(k + i, timeZone), timeZone);
  } while (arc !== last && i < 14);
  return i - 1;
}

/** Convert a solar (Gregorian) date to a Vietnamese lunar date. */
export function solarToLunar(
  dd: number,
  mm: number,
  yy: number,
  timeZone: number = VIETNAM_TZ,
): LunarDate {
  const dayNumber = jdFromDate(dd, mm, yy);
  const k = INT((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, timeZone);
  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(k, timeZone);
  }
  let a11 = getLunarMonth11(yy, timeZone);
  let b11 = a11;
  let lunarYear: number;
  if (a11 >= monthStart) {
    lunarYear = yy;
    a11 = getLunarMonth11(yy - 1, timeZone);
  } else {
    lunarYear = yy + 1;
    b11 = getLunarMonth11(yy + 1, timeZone);
  }
  const lunarDay = dayNumber - monthStart + 1;
  const diff = INT((monthStart - a11) / 29);
  let lunarLeap = false;
  let lunarMonth = diff + 11;
  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, timeZone);
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      if (diff === leapMonthDiff) {
        lunarLeap = true;
      }
    }
  }
  if (lunarMonth > 12) {
    lunarMonth = lunarMonth - 12;
  }
  if (lunarMonth >= 11 && diff < 4) {
    lunarYear -= 1;
  }
  return { day: lunarDay, month: lunarMonth, year: lunarYear, leap: lunarLeap, jd: dayNumber };
}

/**
 * Convert a Vietnamese lunar date to a solar (Gregorian) date.
 * Returns null for invalid dates (e.g. a leap month that does not exist).
 */
export function lunarToSolar(
  lunarDay: number,
  lunarMonth: number,
  lunarYear: number,
  lunarLeap = false,
  timeZone: number = VIETNAM_TZ,
): SolarDate | null {
  let a11: number;
  let b11: number;
  if (lunarMonth < 11) {
    a11 = getLunarMonth11(lunarYear - 1, timeZone);
    b11 = getLunarMonth11(lunarYear, timeZone);
  } else {
    a11 = getLunarMonth11(lunarYear, timeZone);
    b11 = getLunarMonth11(lunarYear + 1, timeZone);
  }
  const k = INT(0.5 + (a11 - 2415021.076998695) / 29.530588853);
  let off = lunarMonth - 11;
  if (off < 0) {
    off += 12;
  }
  if (b11 - a11 > 365) {
    const leapOff = getLeapMonthOffset(a11, timeZone);
    let leapMonth = leapOff - 2;
    if (leapMonth < 0) {
      leapMonth += 12;
    }
    if (lunarLeap && lunarMonth !== leapMonth) {
      return null;
    }
    if (lunarLeap || off >= leapOff) {
      off += 1;
    }
  }
  const monthStart = getNewMoonDay(k + off, timeZone);
  const date = jdToDate(monthStart + lunarDay - 1);
  const roundTrip = solarToLunar(date.day, date.month, date.year, timeZone);
  if (
    roundTrip.day !== lunarDay ||
    roundTrip.month !== lunarMonth ||
    roundTrip.year !== lunarYear ||
    roundTrip.leap !== lunarLeap
  ) {
    return null;
  }
  return date;
}

/** Number of days (29 or 30) in the lunar month containing the given lunar date. */
export function lunarMonthLength(
  lunarMonth: number,
  lunarYear: number,
  lunarLeap = false,
  timeZone: number = VIETNAM_TZ,
): number | null {
  const first = lunarToSolar(1, lunarMonth, lunarYear, lunarLeap, timeZone);
  if (!first) return null;
  const startJd = jdFromDate(first.day, first.month, first.year);
  const d30 = jdToDate(startJd + 29);
  const check = solarToLunar(d30.day, d30.month, d30.year, timeZone);
  return check.day === 30 ? 30 : 29;
}
