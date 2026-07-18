import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getDayInfo, type DayInfo } from 'lunar-core';
import { colors, WEEKDAYS_VI } from './theme';

interface Props {
  year: number;
  month: number; // 1-12
  today: { day: number; month: number; year: number };
  onSelectDay: (info: DayInfo) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export default function MonthView({ year, month, today, onSelectDay, onPrev, onNext, onToday }: Props) {
  const cells = useMemo(() => {
    const n = daysInMonth(year, month);
    const infos: DayInfo[] = [];
    for (let d = 1; d <= n; d++) {
      infos.push(getDayInfo(d, month, year));
    }
    // Monday-first column index; weekday 0 = Sunday
    const lead = (infos[0].solar.weekday + 6) % 7;
    return { infos, lead };
  }, [year, month]);

  const rows: Array<Array<DayInfo | null>> = useMemo(() => {
    const flat: Array<DayInfo | null> = [
      ...Array.from({ length: cells.lead }, () => null),
      ...cells.infos,
    ];
    while (flat.length % 7 !== 0) flat.push(null);
    const r: Array<Array<DayInfo | null>> = [];
    for (let i = 0; i < flat.length; i += 7) r.push(flat.slice(i, i + 7));
    return r;
  }, [cells]);

  const monthLunarLabel = useMemo(() => {
    const first = cells.infos[0].lunar;
    const last = cells.infos[cells.infos.length - 1].lunar;
    const fmt = (l: typeof first) => `${l.month}${l.leap ? ' (n)' : ''}`;
    return first.month === last.month && first.leap === last.leap
      ? `Tháng ${fmt(first)} ÂL`
      : `Tháng ${fmt(first)} – ${fmt(last)} ÂL`;
  }, [cells]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onPrev} style={styles.navBtn} accessibilityLabel="Tháng trước">
          <Text style={styles.navText}>‹</Text>
        </Pressable>
        <Pressable onPress={onToday} style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            Tháng {month}/{year}
          </Text>
          <Text style={styles.headerSub}>{monthLunarLabel}</Text>
        </Pressable>
        <Pressable onPress={onNext} style={styles.navBtn} accessibilityLabel="Tháng sau">
          <Text style={styles.navText}>›</Text>
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS_VI.map((w, i) => (
          <Text
            key={w}
            style={[
              styles.weekday,
              i === 6 && { color: colors.sunday },
              i === 5 && { color: colors.saturday },
            ]}
          >
            {w}
          </Text>
        ))}
      </View>

      {rows.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((info, ci) => {
            if (!info) return <View key={ci} style={styles.cell} />;
            const isToday =
              info.solar.day === today.day &&
              info.solar.month === today.month &&
              info.solar.year === today.year;
            const special = info.isMung1 || info.isRam;
            const holiday = info.holidays.length > 0;
            return (
              <Pressable
                key={ci}
                style={[styles.cell, isToday && styles.todayCell]}
                onPress={() => onSelectDay(info)}
              >
                <Text
                  style={[
                    styles.solarDay,
                    ci === 6 && { color: colors.sunday },
                    ci === 5 && { color: colors.saturday },
                    holiday && { color: colors.primary },
                  ]}
                >
                  {info.solar.day}
                </Text>
                <Text style={[styles.lunarDay, special && styles.lunarSpecial]}>
                  {info.lunar.day === 1
                    ? `1/${info.lunar.month}${info.lunar.leap ? 'n' : ''}`
                    : info.lunar.day}
                </Text>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: info.dayStar.auspicious ? colors.goodDay : 'transparent' },
                  ]}
                />
              </Pressable>
            );
          })}
        </View>
      ))}
      <Text style={styles.legend}>● ngày hoàng đạo · chữ nhỏ: ngày âm lịch</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.card, borderRadius: 16, padding: 8, margin: 8 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.primaryDark },
  headerSub: { fontSize: 13, color: colors.lunar },
  navBtn: { paddingHorizontal: 18, paddingVertical: 4 },
  navText: { fontSize: 28, color: colors.primary, fontWeight: '600' },
  weekRow: { flexDirection: 'row' },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
    color: colors.textMuted,
    paddingVertical: 6,
    fontSize: 13,
  },
  row: { flexDirection: 'row' },
  cell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 10,
    minHeight: 54,
  },
  todayCell: { backgroundColor: colors.todayBg },
  solarDay: { fontSize: 17, fontWeight: '600', color: colors.text },
  lunarDay: { fontSize: 11, color: colors.textMuted },
  lunarSpecial: { color: colors.lunar, fontWeight: '700' },
  dot: { width: 4, height: 4, borderRadius: 2, marginTop: 2 },
  legend: { fontSize: 11, color: colors.textMuted, textAlign: 'center', paddingVertical: 6 },
});
