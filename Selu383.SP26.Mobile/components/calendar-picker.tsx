import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from '@/components/themed-text';
import { DAYS, MONTHS, startOfMonth } from '@/utils/date-utils';
import type { getColors } from '@/constants/styles';

interface CalendarPickerProps {
  selected: Date | null;
  onSelect: (d: Date) => void;
  colors: ReturnType<typeof getColors>;
  minDaysAhead?: number;
}

export function CalendarPicker({ selected, onSelect, colors, minDaysAhead = 0 }: CalendarPickerProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + minDaysAhead);
  const firstDay = startOfMonth(viewYear, viewMonth).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  return (
    <View style={s.wrap}>
      <View style={s.navRow}>
        <TouchableOpacity onPress={prevMonth} style={s.navBtn}>
          <MaterialIcons name="chevron-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={[s.monthLabel, { color: colors.text }]}>
          {MONTHS[viewMonth]} {viewYear}
        </ThemedText>
        <TouchableOpacity onPress={nextMonth} style={s.navBtn}>
          <MaterialIcons name="chevron-right" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={s.headerRow}>
        {DAYS.map((d) => (
          <ThemedText key={d} style={[s.dayHeader, { color: colors.textSecondary }]}>
            {d}
          </ThemedText>
        ))}
      </View>

      <View style={s.grid}>
        {cells.map((day, i) => {
          if (!day) return <View key={`e-${i}`} style={s.cell} />;

          const date = new Date(viewYear, viewMonth, day);
          const isPast = date < minDate;
          const isSelected =
            selected &&
            selected.getFullYear() === viewYear &&
            selected.getMonth() === viewMonth &&
            selected.getDate() === day;

          return (
            <TouchableOpacity
              key={day}
              style={[
                s.cell,
                isSelected && { backgroundColor: colors.primary, borderRadius: 8 },
                isPast && { opacity: 0.3 },
              ]}
              onPress={() => !isPast && onSelect(date)}
              activeOpacity={isPast ? 1 : 0.7}
            >
              <ThemedText style={[s.dayText, { color: isSelected ? '#fff' : colors.text }]}>
                {day}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginBottom: 12 },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  navBtn: { padding: 6 },
  monthLabel: { fontFamily: 'Alegreya_700Bold', fontSize: 15 },
  headerRow: { flexDirection: 'row', marginBottom: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%` as any, aspectRatio: 1, justifyContent: 'center', alignItems: 'center' },
  dayHeader: { width: `${100 / 7}%` as any, textAlign: 'center', fontFamily: 'Alegreya_700Bold', fontSize: 12 },
  dayText: { fontFamily: 'Alegreya_400Regular', fontSize: 14 },
});
