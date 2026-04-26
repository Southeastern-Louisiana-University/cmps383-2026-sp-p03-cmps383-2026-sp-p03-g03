import React from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from '@/components/themed-text';
import { getColors } from '@/constants/styles';
import { styles } from '@/styles/screens/reservations.styles';
import { formatReservationDate } from '@/utils/date-utils';
import type { ReservationDto } from '@/services/api';

type Props = {
  colors: ReturnType<typeof getColors>;
  loadingRes: boolean;
  resError: string | null;
  myRes: ReservationDto[];
  isGuest: boolean;
  cancelError: string | null;
  confirmingId: number | null;
  cancellingId: number | null;
  onRetry: () => void;
  onGoToBook: () => void;
  onDismissCancelError: () => void;
  onConfirmCancel: (id: number) => void;
  onKeepReservation: () => void;
  onCancelReservation: (id: number) => void;
};

export function ReservationsMySection({
  colors,
  loadingRes,
  resError,
  myRes,
  isGuest,
  cancelError,
  confirmingId,
  cancellingId,
  onRetry,
  onGoToBook,
  onDismissCancelError,
  onConfirmCancel,
  onKeepReservation,
  onCancelReservation,
}: Props) {
  if (loadingRes) {
    return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 32 }} />;
  }

  if (resError) {
    return (
      <View style={[styles.emptyCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>{resError}</ThemedText>
        <TouchableOpacity onPress={onRetry} style={[styles.retryBtn, { borderColor: colors.primary }]}>
          <ThemedText style={[styles.retryText, { color: colors.primary }]}>Retry</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  if (myRes.length === 0) {
    return (
      <View style={[styles.emptyCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <MaterialIcons name="calendar-today" size={40} color={colors.textSecondary} style={{ marginBottom: 10 }} />
        <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>No Reservations Yet</ThemedText>
        <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
          {isGuest ? 'Sign in to view and manage your reservations.' : 'Your table is waiting — book your first visit below.'}
        </ThemedText>
        {!isGuest && (
          <TouchableOpacity style={[styles.bookBtn, { backgroundColor: colors.primary }]} onPress={onGoToBook}>
            <ThemedText style={styles.bookBtnText}>Book a Table</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <>
      {cancelError ? (
        <View style={[styles.inlineError, { backgroundColor: '#ef444418', borderColor: '#ef4444' }]}>
          <MaterialIcons name="error-outline" size={16} color="#ef4444" />
          <ThemedText style={styles.inlineErrorText}>{cancelError}</ThemedText>
          <TouchableOpacity onPress={onDismissCancelError}>
            <MaterialIcons name="close" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      ) : null}

      {myRes.map((reservation) => {
        const isPast = new Date(
          reservation.reservedFor.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(reservation.reservedFor)
            ? reservation.reservedFor
            : `${reservation.reservedFor}Z`,
        ) < new Date();

        const isCancelled = reservation.status?.toLowerCase() === 'cancelled';
        const isCompleted = reservation.status?.toLowerCase() === 'completed' || reservation.status?.toLowerCase() === 'noshow';
        const statusColorMap: Record<string, string> = {
          confirmed: '#10b981',
          pending: '#f59e0b',
          cancelled: '#ef4444',
          completed: '#6b7280',
          noshow: '#6b7280',
        };
        const statusColor = isPast && !isCancelled
          ? '#6b7280'
          : statusColorMap[reservation.status?.toLowerCase() ?? ''] ?? '#6b7280';
        const statusLabel = isCancelled ? 'Cancelled' : isPast ? 'Past'
          : (reservation.status?.toLowerCase() === 'pending' ? 'Placed' : reservation.status ?? 'Placed');

        return (
          <View
            key={reservation.id}
            style={[styles.resCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
          >
            <View style={styles.resHeader}>
              <View style={styles.resHeaderInfo}>
                <ThemedText style={[styles.resDate, { color: colors.text }]}>
                  {formatReservationDate(reservation.reservedFor)}
                </ThemedText>
                <ThemedText style={[styles.resMeta, { color: colors.textSecondary }]}>
                  Party of {reservation.partySize} - Table #{reservation.tableId}
                </ThemedText>
                {reservation.customerName ? (
                  <ThemedText style={[styles.resMeta, { color: colors.textSecondary }]}>
                    Reservation for {reservation.customerName}
                  </ThemedText>
                ) : null}
              </View>

              <View style={[styles.statusBadge, { backgroundColor: `${statusColor}22`, borderColor: statusColor }]}>
                <ThemedText style={[styles.statusText, { color: statusColor }]}>
                  {statusLabel}
                </ThemedText>
              </View>
            </View>

            {reservation.specialRequests ? (
              <ThemedText style={[styles.specialReq, { color: colors.textSecondary }]}>
                &quot;{reservation.specialRequests}&quot;
              </ThemedText>
            ) : null}

            {!isCancelled && !isPast && !isCompleted && (
              confirmingId === reservation.id ? (
                <View style={styles.confirmRow}>
                  <ThemedText style={[styles.confirmText, { color: colors.textSecondary }]}>Sure?</ThemedText>
                  <TouchableOpacity
                    style={[styles.confirmYes, { backgroundColor: '#ef4444' }]}
                    onPress={() => onCancelReservation(reservation.id)}
                    activeOpacity={0.8}
                  >
                    {cancellingId === reservation.id
                      ? <ActivityIndicator size="small" color="#fff" />
                      : <ThemedText style={styles.confirmYesText}>Yes, cancel</ThemedText>}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.confirmNo, { borderColor: colors.border }]}
                    onPress={onKeepReservation}
                    activeOpacity={0.8}
                  >
                    <ThemedText style={[styles.confirmNoText, { color: colors.text }]}>Keep it</ThemedText>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.cancelBtn, { borderColor: '#ef4444', opacity: cancellingId === reservation.id ? 0.6 : 1 }]}
                  onPress={() => onConfirmCancel(reservation.id)}
                  activeOpacity={0.8}
                  disabled={cancellingId !== null}
                >
                  <ThemedText style={styles.cancelBtnText}>Cancel Reservation</ThemedText>
                </TouchableOpacity>
              )
            )}
          </View>
        );
      })}
    </>
  );
}