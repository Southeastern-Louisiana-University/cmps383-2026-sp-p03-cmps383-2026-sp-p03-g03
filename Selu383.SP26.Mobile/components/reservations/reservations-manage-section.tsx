import React from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from '@/components/themed-text';
import { getColors } from '@/constants/styles';
import { styles } from '@/styles/screens/reservations.styles';
import { formatReservationDate } from '@/utils/date-utils';
import type { LocationDto, ReservationDto } from '@/services/api';

type Props = {
  colors: ReturnType<typeof getColors>;
  loadingMeta: boolean;
  managedLocations: LocationDto[];
  selectedLocationId: number | null;
  setSelectedLocationId: (value: number) => void;
  manageError: string | null;
  loadingLocationReservations: boolean;
  locationReservations: ReservationDto[];
  managingReservationId: number | null;
  onConfirmReservation: (reservation: ReservationDto) => void;
  onCompleteReservation: (reservation: ReservationDto) => void;
  onCancelReservation: (id: number) => void;
};

export function ReservationsManageSection({
  colors,
  loadingMeta,
  managedLocations,
  selectedLocationId,
  setSelectedLocationId,
  manageError,
  loadingLocationReservations,
  locationReservations,
  managingReservationId,
  onConfirmReservation,
  onCompleteReservation,
  onCancelReservation,
}: Props) {
  if (loadingMeta) {
    return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 32 }} />;
  }

  return (
    <>
      <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Manage by Location</ThemedText>
        {managedLocations.map((location) => (
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
      </View>

      {manageError ? (
        <ThemedText style={styles.errorText}>{manageError}</ThemedText>
      ) : null}

      {loadingLocationReservations ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 16 }} />
      ) : locationReservations.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>All Clear</ThemedText>
          <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>No reservations for this location right now.</ThemedText>
        </View>
      ) : (
        locationReservations.map((reservation) => (
          (() => {
            const normalizedStatus = reservation.status?.toLowerCase() ?? '';
            const statusColorMap: Record<string, string> = {
              pending: '#f59e0b',
              confirmed: '#3b82f6',
              completed: '#6b7280',
              cancelled: '#ef4444',
            };
            const statusColor = statusColorMap[normalizedStatus] ?? '#6b7280';
            const canConfirm = normalizedStatus === 'pending';
            const canComplete = normalizedStatus === 'confirmed';
            const canCancel = normalizedStatus !== 'cancelled' && normalizedStatus !== 'completed';

            return (
          <View key={reservation.id} style={[styles.resCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <View style={styles.resHeader}>
              <View style={styles.resHeaderInfo}>
                <ThemedText style={[styles.resDate, { color: colors.text }]}>{formatReservationDate(reservation.reservedFor)}</ThemedText>
                <ThemedText style={[styles.resMeta, { color: colors.textSecondary }]}>Party of {reservation.partySize} - Table #{reservation.tableId}</ThemedText>
                {reservation.customerName ? (
                  <ThemedText style={[styles.resMeta, { color: colors.textSecondary }]}>Reservation for {reservation.customerName}</ThemedText>
                ) : null}
              </View>
              <View style={[styles.statusBadge, { backgroundColor: `${statusColor}22`, borderColor: statusColor }]}>
                <ThemedText style={[styles.statusText, { color: statusColor }]}>{reservation.status}</ThemedText>
              </View>
            </View>

            {reservation.specialRequests ? (
              <ThemedText style={[styles.specialReq, { color: colors.textSecondary }]}>{reservation.specialRequests}</ThemedText>
            ) : null}

            {canConfirm || canComplete || canCancel ? (
              <View style={styles.manageRow}>
                {canConfirm ? (
                  <TouchableOpacity
                    style={[styles.manageButton, { backgroundColor: '#3b82f6', opacity: managingReservationId === reservation.id ? 0.7 : 1 }]}
                    onPress={() => onConfirmReservation(reservation)}
                    disabled={managingReservationId === reservation.id}
                  >
                    <ThemedText style={styles.manageButtonText}>Confirm</ThemedText>
                  </TouchableOpacity>
                ) : null}

                {canComplete ? (
                  <TouchableOpacity
                    style={[styles.manageButton, { backgroundColor: '#10b981', opacity: managingReservationId === reservation.id ? 0.7 : 1 }]}
                    onPress={() => onCompleteReservation(reservation)}
                    disabled={managingReservationId === reservation.id}
                  >
                    <ThemedText style={styles.manageButtonText}>Mark Completed</ThemedText>
                  </TouchableOpacity>
                ) : null}

                {canCancel ? (
                  <TouchableOpacity
                    style={[styles.manageButton, { backgroundColor: '#ef4444', opacity: managingReservationId === reservation.id ? 0.7 : 1 }]}
                    onPress={() => onCancelReservation(reservation.id)}
                    disabled={managingReservationId === reservation.id}
                  >
                    <ThemedText style={styles.manageButtonText}>Cancel</ThemedText>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}
          </View>
            );
          })()
        ))
      )}
    </>
  );
}