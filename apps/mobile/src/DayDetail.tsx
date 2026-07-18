import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { DayInfo } from 'lunar-core';
import { colors, WEEKDAY_FULL_VI } from './theme';

export default function DayDetail({ info }: { info: DayInfo }) {
  const { solar, lunar, canChi, dayStar, auspiciousHours, solarTerm, holidays } = info;
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={styles.hero}>
        <Text style={styles.heroWeekday}>{WEEKDAY_FULL_VI[solar.weekday]}</Text>
        <Text style={styles.heroDay}>{solar.day}</Text>
        <Text style={styles.heroMonth}>
          Tháng {solar.month} năm {solar.year}
        </Text>
        <View style={styles.lunarBadge}>
          <Text style={styles.lunarBadgeText}>
            Âm lịch: {lunar.day}/{lunar.month}
            {lunar.leap ? ' (nhuận)' : ''} năm {canChi.year.name}
          </Text>
        </View>
      </View>

      {holidays.length > 0 && (
        <View style={[styles.card, styles.holidayCard]}>
          {holidays.map((h) => (
            <Text key={h.name} style={styles.holidayText}>
              🎉 {h.name}
              {h.publicHoliday ? ' (nghỉ lễ)' : ''}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Can chi</Text>
        <View style={styles.rowBetween}>
          <Item label="Ngày" value={canChi.day.name} />
          <Item label="Tháng" value={canChi.month.name} />
          <Item label="Năm" value={canChi.year.name} />
        </View>
        <Text style={styles.term}>Tiết khí: {solarTerm}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Ngày {dayStar.auspicious ? 'hoàng đạo' : 'hắc đạo'} ({dayStar.star})
        </Text>
        <Text
          style={[
            styles.starNote,
            { color: dayStar.auspicious ? colors.goodDay : colors.textMuted },
          ]}
        >
          {dayStar.auspicious
            ? 'Ngày tốt, thuận lợi cho các việc trọng đại.'
            : 'Ngày kém thuận lợi, nên cân nhắc việc trọng đại.'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Giờ hoàng đạo</Text>
        <View style={styles.hourWrap}>
          {auspiciousHours.map((h) => (
            <View key={h.chi} style={styles.hourChip}>
              <Text style={styles.hourChi}>{h.chi}</Text>
              <Text style={styles.hourRange}>{h.range}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={styles.itemLabel}>{label}</Text>
      <Text style={styles.itemValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    margin: 8,
    padding: 20,
    alignItems: 'center',
  },
  heroWeekday: { color: '#FECACA', fontSize: 16, fontWeight: '600' },
  heroDay: { color: '#FFFFFF', fontSize: 64, fontWeight: '800', lineHeight: 70 },
  heroMonth: { color: '#FFE4E6', fontSize: 16 },
  lunarBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 10,
  },
  lunarBadgeText: { color: '#FFF7ED', fontWeight: '600' },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    marginHorizontal: 8,
    marginTop: 8,
    padding: 16,
  },
  holidayCard: { backgroundColor: '#FEF3C7' },
  holidayText: { color: '#92400E', fontWeight: '700', fontSize: 15 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.primaryDark, marginBottom: 10 },
  rowBetween: { flexDirection: 'row' },
  itemLabel: { fontSize: 12, color: colors.textMuted },
  itemValue: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 2 },
  term: { marginTop: 12, color: colors.lunar, fontSize: 13 },
  starNote: { fontSize: 13 },
  hourWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  hourChip: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
  },
  hourChi: { fontWeight: '700', color: colors.lunar },
  hourRange: { fontSize: 11, color: colors.textMuted },
});
