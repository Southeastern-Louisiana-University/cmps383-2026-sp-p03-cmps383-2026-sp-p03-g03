import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { CommonStyles, getColors } from '@/constants/styles';
import { styles } from '@/styles/screens/account.styles';
import type { PaymentMethodDto } from '@/services/api-types';
import { detectCardBrand, formatCardLabel, formatCardNumberInput, getDigitsOnly } from './account-formatters';

type Props = {
  colors: ReturnType<typeof getColors>;
  paymentMethods: PaymentMethodDto[];
  updatingMethodId: number | null;
  onSetDefault: (id: number) => void;
  onDelete: (id: number) => void;
  cardholderName: string;
  setCardholderName: (value: string) => void;
  cardNumber: string;
  setCardNumber: (value: string) => void;
  cvv: string;
  setCvv: (value: string) => void;
  expMonth: string;
  setExpMonth: (value: string) => void;
  expYear: string;
  setExpYear: (value: string) => void;
  setAsDefault: boolean;
  setSetAsDefault: (value: boolean | ((prev: boolean) => boolean)) => void;
  addingMethod: boolean;
  onAddPaymentMethod: () => void;
};

export function PaymentMethodsSection({
  colors,
  paymentMethods,
  updatingMethodId,
  onSetDefault,
  onDelete,
  cardholderName,
  setCardholderName,
  cardNumber,
  setCardNumber,
  cvv,
  setCvv,
  expMonth,
  setExpMonth,
  expYear,
  setExpYear,
  setAsDefault,
  setSetAsDefault,
  addingMethod,
  onAddPaymentMethod,
}: Props) {
  return (
    <View style={[CommonStyles.card, { backgroundColor: colors.cardBackground }]}>
      <ThemedText style={CommonStyles.cardTitle}>Saved Payment Methods</ThemedText>

      {paymentMethods.length === 0 ? (
        <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>No saved cards yet.</ThemedText>
      ) : (
        <View style={styles.stack}>
          {paymentMethods.map((method) => {
            const isBusy = updatingMethodId === method.id;
            return (
              <View key={method.id} style={[styles.methodCard, { borderColor: colors.border, backgroundColor: colors.inputBackground }]}>
                <View style={styles.methodHead}>
                  <ThemedText style={[styles.methodTitle, { color: colors.text }]}>{formatCardLabel(method)}</ThemedText>
                  {method.isDefault && (
                    <View style={[styles.defaultBadge, { backgroundColor: `${colors.primary}22`, borderColor: colors.primary }]}>
                      <ThemedText style={[styles.defaultBadgeText, { color: colors.primary }]}>Default</ThemedText>
                    </View>
                  )}
                </View>

                <ThemedText style={[styles.methodSub, { color: colors.textSecondary }]}>Cardholder: {method.cardholderName}</ThemedText>
                <ThemedText style={[styles.methodSub, { color: colors.textSecondary }]}>Exp: {String(method.expMonth).padStart(2, '0')}/{method.expYear}</ThemedText>

                <View style={styles.methodActions}>
                  {!method.isDefault && (
                    <TouchableOpacity
                      style={[styles.secondaryButton, { borderColor: colors.border }]}
                      onPress={() => onSetDefault(method.id)}
                      disabled={isBusy}
                      activeOpacity={0.85}
                    >
                      <ThemedText style={[styles.secondaryButtonText, { color: colors.text }]}>{isBusy ? 'Saving...' : 'Set Default'}</ThemedText>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.secondaryButton, { borderColor: colors.error }]}
                    onPress={() => onDelete(method.id)}
                    disabled={isBusy}
                    activeOpacity={0.85}
                  >
                    <ThemedText style={[styles.secondaryButtonText, { color: colors.error }]}>Delete</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <ThemedText style={[styles.sectionLabel, { color: colors.text }]}>Add Payment Method</ThemedText>
      <View style={styles.formStack}>
        <TextInput
          style={[
            CommonStyles.input,
            {
              borderColor: colors.border,
              backgroundColor: colors.inputBackground,
              color: colors.text,
            },
          ]}
          value={cardholderName}
          onChangeText={setCardholderName}
          placeholder="Cardholder name"
          placeholderTextColor={colors.textSecondary}
        />

        <TextInput
          style={[
            CommonStyles.input,
            {
              borderColor: colors.border,
              backgroundColor: colors.inputBackground,
              color: colors.text,
              letterSpacing: 2,
            },
          ]}
          value={formatCardNumberInput(cardNumber)}
          onChangeText={(text) => setCardNumber(getDigitsOnly(text).slice(0, 19))}
          placeholder="Card number"
          placeholderTextColor={colors.textSecondary}
          keyboardType="number-pad"
          maxLength={23}
        />
        {cardNumber.length >= 1 && (
          <ThemedText style={[styles.brandHint, { color: colors.textSecondary }]}>
            {detectCardBrand(cardNumber)} · {cardNumber.length} digits
          </ThemedText>
        )}

        <View style={styles.formRow}>
          <TextInput
            style={[
              CommonStyles.input,
              styles.flexInput,
              {
                borderColor: colors.border,
                backgroundColor: colors.inputBackground,
                color: colors.text,
              },
            ]}
            value={cvv}
            onChangeText={(text) => setCvv(getDigitsOnly(text).slice(0, 4))}
            placeholder="CVV"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
            maxLength={4}
          />

          <TextInput
            style={[
              CommonStyles.input,
              styles.flexInput,
              {
                borderColor: colors.border,
                backgroundColor: colors.inputBackground,
                color: colors.text,
              },
            ]}
            value={expMonth}
            onChangeText={setExpMonth}
            placeholder="MM"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
            maxLength={2}
          />

          <TextInput
            style={[
              CommonStyles.input,
              styles.flexInput,
              {
                borderColor: colors.border,
                backgroundColor: colors.inputBackground,
                color: colors.text,
              },
            ]}
            value={expYear}
            onChangeText={setExpYear}
            placeholder="YYYY"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
            maxLength={4}
          />
        </View>

        <TouchableOpacity
          style={[styles.checkboxRow, { borderColor: colors.border }]}
          onPress={() => setSetAsDefault((prev) => !prev)}
          activeOpacity={0.85}
        >
          <View style={[styles.checkbox, { borderColor: colors.border, backgroundColor: setAsDefault ? colors.primary : 'transparent' }]} />
          <ThemedText style={[styles.checkboxLabel, { color: colors.text }]}>Set as default payment method</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary, opacity: addingMethod ? 0.7 : 1 }]}
          onPress={onAddPaymentMethod}
          disabled={addingMethod}
          activeOpacity={0.85}
        >
          <ThemedText style={styles.addButtonText}>{addingMethod ? 'Adding...' : 'Add Payment Method'}</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}