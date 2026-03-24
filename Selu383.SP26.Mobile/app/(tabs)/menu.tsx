import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Modal, Pressable, TextInput, Alert, Platform, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AnimatedButton } from '@/components/animated-button';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MenuItemCard } from '@/components/menu-item-card';
import { useCart } from '@/hooks/useCart';
import * as api from '@/services/api';
import type { MenuItemDto, MenuCategoryDto } from '@/services/api';
import { CommonStyles, getColors } from '@/constants/styles';
import { PageHeaderActions } from '@/components/page-header-actions';

export default function MenuScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = getColors(isDark);
  const [items, setItems] = useState<MenuItemDto[]>([]);
  const [categories, setCategories] = useState<MenuCategoryDto[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();
  const [customizationModal, setCustomizationModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItemDto | null>(null);
  const [customizationNotes, setCustomizationNotes] = useState('');

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[Menu] Fetching menu items and categories...');
      const [menuCategories, menuItems] = await Promise.all([
        api.getMenuCategories(),
        api.getMenuItems()
      ]);
      console.log('[Menu] Got categories:', menuCategories);
      console.log('[Menu] Got items:', menuItems);
      setCategories(menuCategories);
      setItems(menuItems);
      if (menuCategories.length > 0) {
        setSelectedCategoryId(menuCategories[0].id);
      }
    } catch (err: any) {
      console.log('[Menu] Error fetching data:', err.message);
      setError(err.message || 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item: MenuItemDto) => {
    console.log('[Menu] Add to cart:', item.name);
    setSelectedItem(item);
    setCustomizationNotes('');
    setCustomizationModal(true);
  };

  const handleConfirmAddToCart = () => {
    if (selectedItem) {
      console.log('[Menu] Confirming add to cart with notes:', customizationNotes);
      addItem(
        {
          id: selectedItem.id,
          name: selectedItem.name,
          price: selectedItem.basePrice,
          quantity: 1,
        },
        1,
        customizationNotes
      );
      alert(`Added ${selectedItem.name} to cart!`);
      setCustomizationModal(false);
      setSelectedItem(null);
      setCustomizationNotes('');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[CommonStyles.safeArea, { backgroundColor: colors.background }]}>
        <View style={CommonStyles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ThemedText style={CommonStyles.loadingText}>Loading menu...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[CommonStyles.safeArea, { backgroundColor: colors.background }]}>
        <View style={CommonStyles.centerContainer}>
          <ThemedText style={CommonStyles.errorText}>❌ {error}</ThemedText>
          <ThemedText
            style={[CommonStyles.retryText, { color: colors.primary }]}
            onPress={fetchMenuData}
          >
            Tap to retry
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }


  const filteredItems = selectedCategoryId
    ? items.filter(item => item.categoryId === selectedCategoryId)
    : items;

  return (
    <SafeAreaView style={[CommonStyles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={CommonStyles.scrollContent}>
        <ThemedView style={CommonStyles.container}>
          <PageHeaderActions />
          <View style={styles.titleRow}>
            <Image
              source={require('@/assets/images/ConceptLogo2-FpjOWRtT.png')}
              style={styles.titleLogo}
              resizeMode="contain"
            />
            <ThemedText style={CommonStyles.title}>Menu</ThemedText>
          </View>

          {/* Category Filter Buttons */}
          {categories.length > 0 && (
            <View style={styles.categoryContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScrollContent}
              >
                {categories.map((category) => (
                  <AnimatedButton
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      {
                        backgroundColor:
                          selectedCategoryId === category.id
                            ? colors.primary
                            : colors.cardBackground,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setSelectedCategoryId(category.id)}
                  >
                    <ThemedText
                      style={[
                        styles.categoryButtonText,
                        {
                          color:
                            selectedCategoryId === category.id
                              ? '#fff'
                              : colors.text,
                          fontWeight: selectedCategoryId === category.id ? '700' : '500',
                        },
                      ]}
                    >
                      {category.name}
                    </ThemedText>
                  </AnimatedButton>
                ))}
              </ScrollView>
            </View>
          )}

          {filteredItems.length === 0 ? (
            <View style={[CommonStyles.card, { backgroundColor: colors.cardBackground }]}>
              <ThemedText style={styles.description}>
                No menu items available in this category.
              </ThemedText>
            </View>
          ) : (
            <View>
              <ThemedText style={styles.itemCount}>
                {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} in this category
              </ThemedText>
              {filteredItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onPress={handleAddToCart}
                />
              ))}
            </View>
          )}
        </ThemedView>
      </ScrollView>

        {/* Customization Modal */}
        <Modal visible={customizationModal} transparent={true} animationType="slide">
          <SafeAreaView style={[CommonStyles.safeArea, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={CommonStyles.modalContent}>
              <ThemedView style={CommonStyles.container}>
                <ThemedText style={CommonStyles.modalHeader}>
                  Customize: {selectedItem?.name}
                </ThemedText>
                <ThemedText style={styles.modalSubtitle}>
                  Add special instructions for the barista
                </ThemedText>

                <View
                  style={[
                    CommonStyles.input,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.inputBackground,
                      minHeight: 100,
                    },
                  ]}
                >
                  <TextInput
                    placeholder="e.g., Extra hot, no foam, almond milk, etc."
                    placeholderTextColor={colors.textSecondary}
                    value={customizationNotes}
                    onChangeText={setCustomizationNotes}
                    multiline={true}
                    numberOfLines={4}
                    style={[styles.textInput, { color: colors.text }]}
                  />
                </View>

                <ThemedText style={[styles.price, { color: colors.primary }]}>
                  Price: ${selectedItem?.basePrice.toFixed(2) || '0.00'}
                </ThemedText>

                <View style={styles.modalButtons}>
                  <AnimatedButton
                    style={CommonStyles.primaryButton}
                    onPress={handleConfirmAddToCart}
                  >
                    <ThemedText style={CommonStyles.buttonText}>
                      Add to Cart
                    </ThemedText>
                  </AnimatedButton>

                  <AnimatedButton
                    style={[
                      styles.cancelModalButton,
                      { 
                        borderColor: colors.border,
                        backgroundColor: colors.cardBackground,
                      },
                    ]}
                    onPress={() => {
                      setCustomizationModal(false);
                      setSelectedItem(null);
                      setCustomizationNotes('');
                    }}
                  >
                    <ThemedText style={[styles.cancelModalButtonText, { color: colors.textSecondary }]}>
                      Cancel
                    </ThemedText>
                  </AnimatedButton>
                </View>
              </ThemedView>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    );
  }

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  titleLogo: {
    width: 34,
    height: 34,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryScrollContent: {
    paddingVertical: 8,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1.5,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemCount: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  modalSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 20,
  },
  textInput: {
    flex: 1,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButtons: {
    gap: 12,
  },
  cancelModalButton: {
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelModalButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
