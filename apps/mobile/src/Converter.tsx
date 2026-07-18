import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { getDayInfo, lunarToSolar, solarToLunar, yearCanChi } from 'lunar-core';
import { colors, WEEKDAY_FULL_VI } from './theme';

type Direction = 'solar2lunar' | 'lunar2solar';

export default function Converter({ initial }: { initial: { day: number; month: number; year: number } }) {
  const [direction, setDirection] = useState<Direction>('solar2lunar');
  const [day, setDay] = useState(String(initial.day));
  const [month, setMonth] = useState(String(initial.month));
  const [year, setYear] = useState(String(initial.year));
  const [leap, setLeap] = useState(false);

  const result = useMemo(() => {
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    if (!d || !m || !y || m < 1 || m > 12 || d < 1 || d > 31 || y < 1800 || y > 2199) {
      return { error: 'Nhập ngày, tháng, năm hợp lệ (1800–2199).' };
    }
    if (direction === 'solar2lunar') {
      const maxDay = new Date(y, m, 0).getDate();
      if (d > maxDay) return { error: `Tháng ${m}/${y} chỉ có ${maxDay} ngày.` };
      const lunar = solarToLunar(d, m, y);
      const info = getDayInfo(d, m, y);
      return {
        text: `${lunar.day}/${lunar.month}${lunar.leap ? ' (nhuận)' : ''} năm ${yearCanChi(lunar.year).name}`,
        sub: `${WEEKDAY_FULL_VI[info.solar.weekday]} · ngày ${info.canChi.day.name} · ${
          info.dayStar.auspicious ? 'hoàng đạo' : 'hắc đạo'
        }`,
      };
    }
    const solar = lunarToSolar(d, m, y, leap);
    if (!solar) {
      return {
        error: leap
          ? `Năm ${y} không có tháng ${m} nhuận (hoặc ngày không tồn tại).`
          : `Ngày âm lịch không tồn tại.`,
      };
    }
    const info = getDayInfo(solar.day, solar.month, solar.year);
    return {
      text: `${solar.day}/${solar.month}/${solar.year} dương lịch`,
      sub: `${WEEKDAY_FULL_VI[info.solar.weekday]} · ngày ${info.canChi.day.name} · ${
        info.dayStar.auspicious ? 'hoàng đạo' : 'hắc đạo'
      }`,
    };
  }, [direction, day, month, year, leap]);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 8 }}>
      <View style={styles.card}>
        <View style={styles.toggleRow}>
          <Toggle
            active={direction === 'solar2lunar'}
            label="Dương → Âm"
            onPress={() => setDirection('solar2lunar')}
          />
          <Toggle
            active={direction === 'lunar2solar'}
            label="Âm → Dương"
            onPress={() => setDirection('lunar2solar')}
          />
        </View>

        <View style={styles.inputRow}>
          <Field label="Ngày" value={day} onChange={setDay} />
          <Field label="Tháng" value={month} onChange={setMonth} />
          <Field label="Năm" value={year} onChange={setYear} wide />
        </View>

        {direction === 'lunar2solar' && (
          <Pressable style={styles.leapRow} onPress={() => setLeap(!leap)}>
            <View style={[styles.checkbox, leap && styles.checkboxOn]}>
              {leap && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.leapLabel}>Tháng nhuận</Text>
          </Pressable>
        )}

        <View style={styles.resultBox}>
          {'error' in result ? (
            <Text style={styles.error}>{result.error}</Text>
          ) : (
            <>
              <Text style={styles.resultText}>{result.text}</Text>
              <Text style={styles.resultSub}>{result.sub}</Text>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

function Toggle({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable style={[styles.toggle, active && styles.toggleActive]} onPress={onPress}>
      <Text style={[styles.toggleText, active && styles.toggleTextActive]}>{label}</Text>
    </Pressable>
  );
}

function Field({
  label,
  value,
  onChange,
  wide,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  wide?: boolean;
}) {
  return (
    <View style={[styles.field, wide && { flex: 1.6 }]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={(t) => onChange(t.replace(/[^0-9]/g, ''))}
        keyboardType="number-pad"
        maxLength={4}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 16 },
  toggleRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  toggle: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    alignItems: 'center',
  },
  toggleActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  toggleText: { fontWeight: '600', color: colors.textMuted },
  toggleTextActive: { color: '#FFFFFF' },
  inputRow: { flexDirection: 'row', gap: 8 },
  field: { flex: 1 },
  fieldLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    backgroundColor: colors.background,
  },
  leapRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.primary },
  checkmark: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  leapLabel: { marginLeft: 8, color: colors.text, fontWeight: '600' },
  resultBox: {
    marginTop: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  resultText: { fontSize: 20, fontWeight: '800', color: colors.primaryDark, textAlign: 'center' },
  resultSub: { marginTop: 6, color: colors.lunar, fontSize: 13, textAlign: 'center' },
  error: { color: colors.sunday, fontWeight: '600', textAlign: 'center' },
});
