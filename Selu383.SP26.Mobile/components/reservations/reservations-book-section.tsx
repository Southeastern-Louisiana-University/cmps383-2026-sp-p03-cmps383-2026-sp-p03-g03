import React from 'react';
import { ActivityIndicator, Image, TextInput, TouchableOpacity, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AnimatedButton } from '@/components/animated-button';
import { CalendarPicker } from '@/components/calendar-picker';
import { ThemedText } from '@/components/themed-text';
import { getColors } from '@/constants/styles';
import { styles } from '@/styles/screens/reservations.styles';
import { HOUR_SLOTS, formatHour } from '@/utils/date-utils';
import type { LocationDto, TableDto } from '@/services/api';

type Props = {
  colors: ReturnType<typeof getColors>;
  loadingMeta: boolean;
  locations: LocationDto[];
  selectedLocationId: number | null;
  setSelectedLocationId: (value: number) => void;
  partySize: number;
  setPartySize: (value: number) => void;
  selectedDate: Date | null;
  setSelectedDate: (value: Date | null) => void;
  selectedHour: number | null;
  setSelectedHour: (value: number | null) => void;
  eligibleTables: TableDto[];
  takenTableIds: number[];
  selectedTableId: number | null;
  setSelectedTableId: (value: number) => void;
  specialRequests: string;
  setSpecialRequests: (value: string) => void;
  reservationName: string;
  setReservationName: (value: string) => void;
  bookingError: string | null;
  booking: boolean;
  onBook: () => void;
};

export function ReservationsBookSection({
  colors,
  loadingMeta,
  locations,
  selectedLocationId,
  setSelectedLocationId,
  partySize,
  setPartySize,
  selectedDate,
  setSelectedDate,
  selectedHour,
  setSelectedHour,
  eligibleTables,
  takenTableIds,
  selectedTableId,
  setSelectedTableId,
  specialRequests,
  setSpecialRequests,
  reservationName,
  setReservationName,
  bookingError,
  booking,
  onBook,
}: Props) {
  if (loadingMeta) {
    return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 32 }} />;
  }

  return (
    <>
      <View style={styles.heroWrap}>
        <Image
          source={require('@/assets/images/table.jpg')}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <ThemedText style={styles.heroKicker}>Dine with the Pride</ThemedText>
          <ThemedText style={styles.heroTitle}>Reserve Your Table</ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            Secure your spot at least 2 hours ahead. Bar seats are walk-in only.
          </ThemedText>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Location</ThemedText>
        {locations.map((location) => (
          <TouchableOpacity
            key={location.id}
            style={[
              styles.locationOption,
              {
                borderColor: selectedLocationId === location.id ? colors.primary : colors.border,
                backgroundColor: selectedLocationId === location.id ? `${colors.primary}18` : 'transparent',
              },
            ]}
            onPress={() => setSelectedLocationId(location.id)}
            activeOpacity={0.85}
          >
            <MaterialIcons
              name={selectedLocationId === location.id ? 'radio-button-checked' : 'radio-button-unchecked'}
              size={18}
              color={selectedLocationId === location.id ? colors.primary : colors.textSecondary}
            />
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.locationName, { color: colors.text }]}>{location.name}</ThemedText>
              <ThemedText style={[styles.locationAddr, { color: colors.textSecondary }]}>
                {location.address}, {location.city}
              </ThemedText>
            </View>
          </TouchableOpacity>
        ))}
        <ThemedText style={[styles.locationAddr, { color: colors.textSecondary, marginTop: 4 }]}>
          Accessibility: ADA compliant. No pets allowed except trained service animals.
        </ThemedText>
      </View>

      <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Party Size</ThemedText>
        <View style={styles.partySizeRow}>
          {[2, 3, 4, 5, 6].map((size) => (
            <TouchableOpacity
              key={size}
              style={[
                styles.sizeBtn,
                {
                  borderColor: partySize === size ? colors.primary : colors.border,
                  backgroundColor: partySize === size ? colors.primary : 'transparent',
                },
              ]}
              onPress={() => setPartySize(size)}
            >
              <ThemedText style={[styles.sizeBtnText, { color: partySize === size ? '#fff' : colors.text }]}>
                {size}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Date</ThemedText>
        <CalendarPicker
          selected={selectedDate}
          onSelect={(date) => {
            setSelectedDate(date);
            setSelectedHour(null);
          }}
          colors={colors}
          minDaysAhead={1}
        />
      </View>

      {selectedDate && (
        <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Time (6 AM - 6 PM)</ThemedText>
          <View style={styles.timeGrid}>
            {HOUR_SLOTS.map((hour) => {
              const slotDate = new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                selectedDate.getDate(),
                hour,
              );
              const tooSoon = slotDate.getTime() - Date.now() < 2 * 60 * 60 * 1000;
              const isSelected = selectedHour === hour;

              return (
                <TouchableOpacity
                  key={hour}
                  style={[
                    styles.timeBtn,
                    {
                      borderColor: isSelected ? colors.primary : colors.border,
                      backgroundColor: isSelected ? colors.primary : 'transparent',
                      opacity: tooSoon ? 0.35 : 1,
                    },
                  ]}
                  onPress={() => !tooSoon && setSelectedHour(hour)}
                  activeOpacity={tooSoon ? 1 : 0.8}
                >
                  <ThemedText style={[styles.timeBtnText, { color: isSelected ? '#fff' : colors.text }]}>
                    {formatHour(hour)}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {selectedDate && selectedHour !== null && (
        <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Table</ThemedText>
          {eligibleTables.length === 0 ? (
            <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
              No tables available for party of {partySize} at this location.
            </ThemedText>
          ) : eligibleTables.map((table) => {
            const isTaken = takenTableIds.includes(table.id);

            return (
              <TouchableOpacity
                key={table.id}
                style={[
                  styles.tableOption,
                  {
                    borderColor: selectedTableId === table.id ? colors.primary : colors.border,
                    backgroundColor: selectedTableId === table.id ? `${colors.primary}18` : 'transparent',
                    opacity: isTaken ? 0.45 : 1,
                  },
                ]}
                onPress={() => !isTaken && setSelectedTableId(table.id)}
                activeOpacity={isTaken ? 1 : 0.85}
              >
                <MaterialIcons
                  name={selectedTableId === table.id ? 'radio-button-checked' : 'radio-button-unchecked'}
                  size={18}
                  color={selectedTableId === table.id ? colors.primary : colors.textSecondary}
                />
                <ThemedText style={[styles.tableText, { color: colors.text }]}>
                  Table {table.tableNumber} - {table.seats} seats{isTaken ? ' - Taken' : ''}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Reservation Name</ThemedText>
        <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.inputBackground, minHeight: 52 }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Name on the reservation (e.g. Joe Smith)"
            placeholderTextColor={colors.textSecondary}
            value={reservationName}
            onChangeText={setReservationName}
            autoCapitalize="words"
            maxLength={100}
          />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Special Requests</ThemedText>
        <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.inputBackground }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Allergies, occasion, seating preference... (optional)"
            placeholderTextColor={colors.textSecondary}
            value={specialRequests}
            onChangeText={setSpecialRequests}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      </View>

      {bookingError ? (
        <ThemedText style={styles.errorText}>{bookingError}</ThemedText>
      ) : null}

      <AnimatedButton
        style={[styles.bookSubmitBtn, { backgroundColor: booking ? colors.border : colors.primary }]}
        onPress={onBook}
      >
        {booking
          ? <ActivityIndicator color="#fff" />
          : <ThemedText style={styles.bookSubmitText}>Confirm Reservation</ThemedText>}
      </AnimatedButton>
    </>
  );
}