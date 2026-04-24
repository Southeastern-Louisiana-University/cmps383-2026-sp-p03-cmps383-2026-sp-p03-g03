import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedButton } from '@/components/animated-button';
import { ThemedText } from '@/components/themed-text';
import { getColors } from '@/constants/styles';
import { styles } from '@/styles/screens/menu.styles';
import type { MenuCategoryDto } from '@/services/api';

type Props = {
  colors: ReturnType<typeof getColors>;
  visible: boolean;
  onClose: () => void;
  categories: MenuCategoryDto[];
  newItemCategoryId: number | null;
  setNewItemCategoryId: (id: number) => void;
  newItemName: string;
  setNewItemName: (value: string) => void;
  newItemDescription: string;
  setNewItemDescription: (value: string) => void;
  newItemPrice: string;
  setNewItemPrice: (value: string) => void;
  addItemError: string | null;
  addingItem: boolean;
  onSubmit: () => void;
};

export function AddMenuItemModal({
  colors,
  visible,
  onClose,
  categories,
  newItemCategoryId,
  setNewItemCategoryId,
  newItemName,
  setNewItemName,
  newItemDescription,
  setNewItemDescription,
  newItemPrice,
  setNewItemPrice,
  addItemError,
  addingItem,
  onSubmit,
}: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.modalHeader}>
            <ThemedText style={[styles.modalTitle, { color: colors.text }]}>Add Menu Item</ThemedText>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14, maxHeight: 42 }}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.catChip,
                  {
                    backgroundColor: newItemCategoryId === cat.id ? colors.primary : 'transparent',
                    borderColor: newItemCategoryId === cat.id ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setNewItemCategoryId(cat.id)}
              >
                <Text
                  style={[
                    styles.catChipText,
                    { color: newItemCategoryId === cat.id ? '#fff' : colors.text },
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Name</Text>
          <TextInput
            style={[styles.formInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            placeholder="e.g. Caramel Latte"
            placeholderTextColor={colors.textSecondary}
            value={newItemName}
            onChangeText={setNewItemName}
            maxLength={120}
          />

          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Description (optional)</Text>
          <TextInput
            style={[styles.formInput, styles.formInputMultiline, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            placeholder="Short description..."
            placeholderTextColor={colors.textSecondary}
            value={newItemDescription}
            onChangeText={setNewItemDescription}
            multiline
            maxLength={500}
          />

          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Price ($)</Text>
          <TextInput
            style={[styles.formInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            placeholder="0.00"
            placeholderTextColor={colors.textSecondary}
            value={newItemPrice}
            onChangeText={setNewItemPrice}
            keyboardType="decimal-pad"
          />

          {addItemError && (
            <Text style={styles.addItemError}>{addItemError}</Text>
          )}

          <AnimatedButton
            style={[styles.addItemSubmitBtn, { backgroundColor: colors.primary, opacity: addingItem ? 0.7 : 1 }]}
            onPress={onSubmit}
            disabled={addingItem}
          >
            {addingItem
              ? <ActivityIndicator color="#fff" />
              : <ThemedText style={styles.addItemSubmitText}>Add Item</ThemedText>}
          </AnimatedButton>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
