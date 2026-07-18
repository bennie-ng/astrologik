import React, { useMemo, useState } from 'react';
import { Platform, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { getDayInfo, type DayInfo } from 'lunar-core';
import MonthView from './src/MonthView';
import DayDetail from './src/DayDetail';
import Converter from './src/Converter';
import { colors } from './src/theme';

type Tab = 'calendar' | 'day' | 'convert';

export default function App() {
  const today = useMemo(() => {
    const now = new Date();
    return { day: now.getDate(), month: now.getMonth() + 1, year: now.getFullYear() };
  }, []);

  const [tab, setTab] = useState<Tab>('calendar');
  const [viewYear, setViewYear] = useState(today.year);
  const [viewMonth, setViewMonth] = useState(today.month);
  const [selected, setSelected] = useState<DayInfo>(() =>
    getDayInfo(today.day, today.month, today.year),
  );

  const goMonth = (delta: number) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    setViewMonth(m);
    setViewYear(y);
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.appBar}>
        <Text style={styles.appTitle}>Lịch Vạn Niên</Text>
      </View>

      <View style={styles.content}>
        {tab === 'calendar' && (
          <MonthView
            year={viewYear}
            month={viewMonth}
            today={today}
            onPrev={() => goMonth(-1)}
            onNext={() => goMonth(1)}
            onToday={() => {
              setViewYear(today.year);
              setViewMonth(today.month);
            }}
            onSelectDay={(info) => {
              setSelected(info);
              setTab('day');
            }}
          />
        )}
        {tab === 'day' && <DayDetail info={selected} />}
        {tab === 'convert' && <Converter initial={today} />}
      </View>

      <View style={styles.tabBar}>
        <TabButton label="Lịch tháng" icon="📅" active={tab === 'calendar'} onPress={() => setTab('calendar')} />
        <TabButton label="Chi tiết ngày" icon="🌞" active={tab === 'day'} onPress={() => setTab('day')} />
        <TabButton label="Đổi ngày" icon="🔄" active={tab === 'convert'} onPress={() => setTab('convert')} />
      </View>
    </SafeAreaView>
  );
}

function TabButton({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.tabBtn} onPress={onPress}>
      <Text style={styles.tabIcon}>{icon}</Text>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  appBar: {
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === 'android' ? 40 : 8,
    paddingBottom: 12,
    alignItems: 'center',
  },
  appTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  content: { flex: 1, maxWidth: 520, width: '100%', alignSelf: 'center' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 6,
  },
  tabBtn: { flex: 1, alignItems: 'center' },
  tabIcon: { fontSize: 20 },
  tabLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  tabLabelActive: { color: colors.primary, fontWeight: '700' },
});
