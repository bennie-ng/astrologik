/**
 * Astronomical helpers for the Vietnamese lunisolar calendar,
 * based on the algorithm published by Hồ Ngọc Đức
 * (https://www.informatik.uni-leipzig.de/~duc/amlich/).
 *
 * All lunar dates are computed for the Vietnamese time zone UTC+7,
 * which is what makes the Vietnamese calendar occasionally differ
 * from the Chinese one (computed at UTC+8).
 */

const DR = Math.PI / 180;

export const VIETNAM_TZ = 7;

/** Integer part, rounding toward negative infinity. */
export function INT(d: number): number {
  return Math.floor(d);
}

/** Julian day number of a (proleptic Gregorian/Julian) calendar date. */
export function jdFromDate(dd: number, mm: number, yy: number): number {
  const a = INT((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  let jd =
    dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045;
  if (jd < 2299161) {
    jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083;
  }
  return jd;
}

/** Calendar date { day, month, year } of a Julian day number. */
export function jdToDate(jd: number): { day: number; month: number; year: number } {
  let a: number;
  let b: number;
  let c: number;
  if (jd > 2299160) {
    a = jd + 32044;
    b = INT((4 * a + 3) / 146097);
    c = a - INT((b * 146097) / 4);
  } else {
    b = 0;
    c = jd + 32082;
  }
  const d = INT((4 * c + 3) / 1461);
  const e = c - INT((1461 * d) / 4);
  const m = INT((5 * e + 2) / 153);
  const day = e - INT((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * INT(m / 10);
  const year = b * 100 + d - 4800 + INT(m / 10);
  return { day, month, year };
}

/**
 * Julian day (with fraction) of the k-th new moon after the new moon of
 * 1900-01-01. Accuracy ~2 minutes — more than enough for calendar work.
 */
export function newMoon(k: number): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * DR);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * DR) + 0.0021 * Math.sin(2 * DR * M);
  C1 = C1 - 0.4068 * Math.sin(Mpr * DR) + 0.0161 * Math.sin(DR * 2 * Mpr);
  C1 = C1 - 0.0004 * Math.sin(DR * 3 * Mpr);
  C1 = C1 + 0.0104 * Math.sin(DR * 2 * F) - 0.0051 * Math.sin(DR * (M + Mpr));
  C1 = C1 - 0.0074 * Math.sin(DR * (M - Mpr)) + 0.0004 * Math.sin(DR * (2 * F + M));
  C1 = C1 - 0.0004 * Math.sin(DR * (2 * F - M)) - 0.0006 * Math.sin(DR * (2 * F + Mpr));
  C1 = C1 + 0.001 * Math.sin(DR * (2 * F - Mpr)) + 0.0005 * Math.sin(DR * (2 * Mpr + M));
  let deltat: number;
  if (T < -11) {
    deltat =
      0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3;
  } else {
    deltat = -0.000278 + 0.000265 * T + 0.000262 * T2;
  }
  return Jd1 + C1 - deltat;
}

/** Ecliptic longitude of the sun, in radians [0, 2π), at Julian day jdn. */
export function sunLongitude(jdn: number): number {
  const T = (jdn - 2451545.0) / 36525;
  const T2 = T * T;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(DR * M);
  DL += (0.019993 - 0.000101 * T) * Math.sin(DR * 2 * M) + 0.00029 * Math.sin(DR * 3 * M);
  let L = (L0 + DL) * DR;
  L = L - Math.PI * 2 * INT(L / (Math.PI * 2));
  return L;
}

/** Local calendar day (JDN at the given time zone) containing the k-th new moon. */
export function getNewMoonDay(k: number, timeZone: number): number {
  return INT(newMoon(k) + 0.5 + timeZone / 24);
}

/**
 * Index (0..11) of the major solar term the sun is in at local midnight
 * beginning the given day. 0 = sun longitude in [0°, 30°), i.e. from Xuân phân.
 */
export function getSunLongitudeIndex(dayNumber: number, timeZone: number): number {
  return INT((sunLongitude(dayNumber - 0.5 - timeZone / 24) / Math.PI) * 6);
}

/** Index (0..23) of the solar term (tiết khí), 0 = Xuân phân (longitude 0°). */
export function getSolarTermIndex(dayNumber: number, timeZone: number): number {
  return INT((sunLongitude(dayNumber - 0.5 - timeZone / 24) / Math.PI) * 12);
}
