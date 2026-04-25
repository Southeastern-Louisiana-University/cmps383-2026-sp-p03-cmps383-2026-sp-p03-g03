import React, { useCallback, useMemo, useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Image,
  Modal,
  Platform,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AnimatedButton } from "@/components/animated-button";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { CategoryTabs } from "@/components/category-tabs";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import * as api from "@/services/api";
import { getUserPermissions } from "@/utils/role-helpers";
import type { MenuItemDto, MenuCategoryDto, LocationDto } from "@/services/api";
import { CommonStyles, getColors } from "@/constants/styles";
import { PageHeaderActions } from "@/components/page-header-actions";
import { styles } from "@/styles/screens/menu.styles";
import { AddMenuItemModal } from "../../components/menu/add-menu-item-modal";
import { MenuItemList } from "../../components/menu/menu-item-list";

export default function MenuScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = getColors(isDark);
  const router = useRouter();
  const params = useLocalSearchParams<{ itemId?: string }>();
  const highlightedItemId = params.itemId ? Number(params.itemId) : null;
  const { addItem, cart, setCartLocation } = useCart();
  const { user } = useAuth();

  const [items, setItems] = useState<MenuItemDto[]>([]);
  const [categories, setCategories] = useState<MenuCategoryDto[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemImageUrl, setNewItemImageUrl] = useState("");
  const [newItemCategoryId, setNewItemCategoryId] = useState<number | null>(null);
  const [addingItem, setAddingItem] = useState(false);
  const [addItemError, setAddItemError] = useState<string | null>(null);

  const [disableReasonItem, setDisableReasonItem] = useState<MenuItemDto | null>(null);
  const [disableReason, setDisableReason] = useState("");
  const [disableReasonError, setDisableReasonError] = useState<string | null>(null);
  const hasLoadedLocationsRef = useRef(false);
  const fetchInFlightRef = useRef(false);

  const [locations, setLocations] = useState<LocationDto[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const { isAdmin, isManager } = getUserPermissions(user?.roles);
  const hasMenuOpsAccess = isAdmin || isManager;

  const scopeLocationsForUser = useCallback(
    (allLocations: LocationDto[]) => {
      if (isAdmin) {
        return allLocations;
      }

      if (isManager) {
        if (user?.locationId) {
          return allLocations.filter((loc) => loc.id === user.locationId);
        }

        if (user?.id) {
          return allLocations.filter((loc) => loc.managerId === user.id);
        }
      }

      if (user?.locationId) {
        return allLocations.filter((loc) => loc.id === user.locationId);
      }

      return allLocations;
    },
    [isAdmin, isManager, user?.id, user?.locationId],
  );

  const fetchMenuData = useCallback(
    // load items + categories (by location if selected)
    async (isRefresh = false) => {
      if (fetchInFlightRef.current) {
        return;
      }

      fetchInFlightRef.current = true;

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          // Only show the full-screen loader on the first load— keep prior items
          // visible during silent refetches so the screen doesn't flash empty.
          setLoading((prev) => (prev ? prev : false));
        }

        setError(null);

        let menuCategories: MenuCategoryDto[];
        let menuItems: MenuItemDto[];

        if (selectedLocationId) {
          const locationCats = await api.getMenuByLocation(selectedLocationId);
          menuCategories = locationCats.map((c) => ({
            id: c.id,
            name: c.name,
            locationIds: c.locationIds,
            isSeasonal: c.isSeasonal,
            isActive: c.isActive,
          }));
          menuItems = locationCats.flatMap((c) => c.items);
        } else {
          [menuCategories, menuItems] = await Promise.all([
            api.getMenuCategories(),
            api.getMenuItems(),
          ]);
        }

        const orderedCategories = [...menuCategories].sort((a, b) => {
          if (a.name === "Drinks" && b.name !== "Drinks") return -1;
          if (b.name === "Drinks" && a.name !== "Drinks") return 1;
          return 0;
        });

        setCategories(orderedCategories);
        setItems(menuItems);

        if (highlightedItemId) {
          const targetItem = menuItems.find(
            (item) => item.id === highlightedItemId,
          );
          if (targetItem) {
            setSelectedCategoryId(targetItem.categoryId);
          } else if (orderedCategories.length > 0) {
            setSelectedCategoryId(orderedCategories[0].id);
          }
        } else if (orderedCategories.length > 0) {
          setSelectedCategoryId(orderedCategories[0].id);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load menu");
      } finally {
        fetchInFlightRef.current = false;
        setLoading(false);
        setRefreshing(false);
      }
    },
    [highlightedItemId, selectedLocationId],
  );

  useEffect(() => {
    if (hasLoadedLocationsRef.current) {
      return;
    }

    hasLoadedLocationsRef.current = true;

    (async () => {
      try {
        const locs = await api.getLocations();
        const scopedLocations = scopeLocationsForUser(locs);
        setLocations(scopedLocations);
        if (scopedLocations.length > 0 && !selectedLocationId) {
          setSelectedLocationId(scopedLocations[0].id);
        } else if (scopedLocations.length === 0) {
          // no locations — load menu without location filter so spinner clears
          void fetchMenuData();
        }
      } catch {
        // locations failed — still load the menu so the spinner doesn't hang
        void fetchMenuData();
      }
    })();
  }, [fetchMenuData, scopeLocationsForUser, selectedLocationId]);

  useEffect(() => {
    if (locations.length === 0) {
      return;
    }

    if (!selectedLocationId || !locations.some((loc) => loc.id === selectedLocationId)) {
      setSelectedLocationId(locations[0].id);
    }
  }, [locations, selectedLocationId]);

  useFocusEffect(
    useCallback(() => {
      if (!hasLoadedLocationsRef.current) {
        return;
      }

      if (locations.length > 0 && !selectedLocationId) {
        return;
      }

      if (locations.length === 0 && !selectedLocationId) {
        return;
      }

      void fetchMenuData();
    }, [fetchMenuData, locations.length, selectedLocationId]),
  );

  const addMenuItemToCart = (item: MenuItemDto, notes?: string) => {
    if (!item.isAvailable) {
      Alert.alert(
        "Unavailable",
        item.unavailableReason || "This item is currently unavailable.",
      );
      return;
    }

    if (selectedLocationId) {
      setCartLocation(selectedLocationId);
    }

    addItem(
      {
        id: item.id,
        name: item.name,
        price: item.basePrice,
        quantity: 1,
      },
      1,
      notes?.trim() || undefined,
    );

    router.push("/(tabs)/cart");
  };

  const handleSelectItem = (item: MenuItemDto) => {
    addMenuItemToCart(item);
  };

  const disableItemWithReason = async (item: MenuItemDto, reason: string) => {
    try {
      setUpdatingItemId(item.id);
      if (selectedLocationId) {
        const availability = await api.disableMenuItemAtLocation(item.id, selectedLocationId, reason);
        setItems((prev) =>
          prev.map((menuItem) =>
            menuItem.id === item.id
              ? { ...menuItem, isAvailable: availability.isAvailable, unavailableReason: availability.unavailableReason }
              : menuItem,
          ),
        );
      } else {
        const updated = await api.disableMenuItem(item.id, reason);
        setItems((prev) =>
          prev.map((menuItem) =>
            menuItem.id === item.id ? updated : menuItem,
          ),
        );
      }
    } catch (err: any) {
      Alert.alert("Update Failed", err.message || "Could not disable item.");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleDisableItem = async (item: MenuItemDto) => {
    setDisableReasonItem(item);
    setDisableReason("");
    setDisableReasonError(null);
  };

  const submitDisableReason = async () => {
    if (!disableReasonItem) {
      return;
    }

    const reason = disableReason.trim();
    if (!reason) {
      setDisableReasonError("Reason is required.");
      return;
    }

    setDisableReasonError(null);
    await disableItemWithReason(disableReasonItem, reason);
    setDisableReasonItem(null);
    setDisableReason("");
  };

  const handleEnableItem = async (item: MenuItemDto) => {
    try {
      setUpdatingItemId(item.id);
      if (selectedLocationId) {
        const availability = await api.enableMenuItemAtLocation(item.id, selectedLocationId);
        setItems((prev) =>
          prev.map((menuItem) =>
            menuItem.id === item.id
              ? { ...menuItem, isAvailable: availability.isAvailable, unavailableReason: availability.unavailableReason }
              : menuItem,
          ),
        );
      } else {
        const updated = await api.enableMenuItem(item.id);
        setItems((prev) =>
          prev.map((menuItem) =>
            menuItem.id === item.id ? updated : menuItem,
          ),
        );
      }
    } catch (err: any) {
      Alert.alert("Update Failed", err.message || "Could not enable item.");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleDeleteItem = async (item: MenuItemDto) => {
    Alert.alert(
      "Delete Item",
      `Are you sure you want to delete "${item.name}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setUpdatingItemId(item.id);
              await api.deleteMenuItem(item.id);
              setItems((prev) => prev.filter((i) => i.id !== item.id));
            } catch (err: any) {
              Alert.alert("Delete Failed", err.message || "Could not delete item.");
            } finally {
              setUpdatingItemId(null);
            }
          },
        },
      ],
    );
  };

  const handleOpenAddForm = () => {
    setNewItemName("");
    setNewItemDescription("");
    setNewItemPrice("");
    setNewItemImageUrl("");
    setNewItemCategoryId(selectedCategoryId ?? (categories.length ? categories[0].id : null));
    setAddItemError(null);
    setShowAddForm(true);
  };

  const handleAddItem = async () => {
    setAddItemError(null);

    if (!newItemName.trim()) {
      setAddItemError("Item name is required.");
      return;
    }
    if (!newItemCategoryId) {
      setAddItemError("Select a category.");
      return;
    }
    const price = parseFloat(newItemPrice);
    if (isNaN(price) || price < 0.01 || price > 1000) {
      setAddItemError("Price must be between $0.01 and $1000.");
      return;
    }

    try {
      setAddingItem(true);
      const created = await api.createMenuItem({
        categoryId: newItemCategoryId,
        locationId: selectedLocationId ?? undefined,
        name: newItemName.trim(),
        description: newItemDescription.trim() || undefined,
        imagePath: newItemImageUrl.trim() || undefined,
        basePrice: Math.round(price * 100) / 100,
      });
      setItems((prev) => [...prev, created]);
      setSelectedCategoryId(created.categoryId);
      setShowAddForm(false);
    } catch (err: any) {
      setAddItemError(err.message || "Failed to add item.");
    } finally {
      setAddingItem(false);
    }
  };

  const filteredItems = useMemo(() => {
    let list = selectedCategoryId
      ? items.filter((item) => item.categoryId === selectedCategoryId)
      : items;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q),
      );
    }

    if (highlightedItemId) {
      list = [...list].sort((a, b) => {
        if (a.id === highlightedItemId) return -1;
        if (b.id === highlightedItemId) return 1;
        return 0;
      });
    }

    return list;
  }, [items, selectedCategoryId, searchQuery, highlightedItemId]);

  const categoryNameById = useMemo(
    () => categories.reduce<Record<number, string>>((acc, category) => {
      acc[category.id] = category.name;
      return acc;
    }, {}),
    [categories],
  );

  if (loading) {
    return (
      <SafeAreaView
        style={[CommonStyles.safeArea, { backgroundColor: colors.background }]}
      >
        <View style={CommonStyles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ThemedText style={CommonStyles.loadingText}>
            Loading menu...
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        style={[CommonStyles.safeArea, { backgroundColor: colors.background }]}
      >
        <View style={CommonStyles.centerContainer}>
          <ThemedText style={CommonStyles.errorText}>❌ {error}</ThemedText>
          <ThemedText
            style={[CommonStyles.retryText, { color: colors.primary }]}
            onPress={() => {
              void fetchMenuData();
            }}
          >
            Tap to retry
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[CommonStyles.safeArea, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={CommonStyles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              void fetchMenuData(true);
            }}
            tintColor={colors.primary}
          />
        }
      >
        <ThemedView style={CommonStyles.container}>
          <PageHeaderActions showPortal />

          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Image
                source={require("@/assets/images/ConceptLogo2-FpjOWRtT.png")}
                style={styles.titleLogo}
                resizeMode="contain"
              />
              <ThemedText style={styles.title}>Menu</ThemedText>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {hasMenuOpsAccess && (
                <TouchableOpacity
                  style={[styles.addItemBtn, { backgroundColor: colors.primary }]}
                  onPress={handleOpenAddForm}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.cartBtn}
                onPress={() => router.push("/(tabs)/cart")}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="cart-outline"
                  size={26}
                  color={colors.text}
                />
                {cartCount > 0 && (
                  <View
                    style={[
                      styles.cartBadge,
                      { backgroundColor: colors.primary },
                    ]}
                  >
                    <Text style={styles.cartBadgeText}>{cartCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {locations.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 10, maxHeight: 40 }}
              contentContainerStyle={{ gap: 8, paddingHorizontal: 2 }}
            >
              {locations.map((loc) => (
                <TouchableOpacity
                  key={loc.id}
                  style={[
                    styles.catChip,
                    {
                      backgroundColor: selectedLocationId === loc.id ? colors.primary : 'transparent',
                      borderColor: selectedLocationId === loc.id ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedLocationId(loc.id)}
                >
                  <Text
                    style={[
                      styles.catChipText,
                      { color: selectedLocationId === loc.id ? '#fff' : colors.text },
                    ]}
                  >
                    {loc.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <View
            style={[
              styles.searchWrap,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <Ionicons
              name="search"
              size={18}
              color={colors.textSecondary}
            />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search menu..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={() => setSearchQuery("")}
              >
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>

          {categories.length > 0 && (
            <CategoryTabs
              categories={categories}
              selectedId={selectedCategoryId}
              onSelect={setSelectedCategoryId}
            />
          )}

          <MenuItemList
            colors={colors}
            filteredItems={filteredItems}
            categoryNameById={categoryNameById}
            highlightedItemId={highlightedItemId}
            searchQuery={searchQuery}
            hasMenuOpsAccess={hasMenuOpsAccess}
            updatingItemId={updatingItemId}
            onSelectItem={handleSelectItem}
            onDisableItem={handleDisableItem}
            onEnableItem={handleEnableItem}
            onDeleteItem={handleDeleteItem}
          />
        </ThemedView>
      </ScrollView>

      <AddMenuItemModal
        colors={colors}
        visible={showAddForm}
        onClose={() => setShowAddForm(false)}
        categories={categories}
        newItemCategoryId={newItemCategoryId}
        setNewItemCategoryId={setNewItemCategoryId}
        newItemName={newItemName}
        setNewItemName={setNewItemName}
        newItemDescription={newItemDescription}
        setNewItemDescription={setNewItemDescription}
        newItemPrice={newItemPrice}
        setNewItemPrice={setNewItemPrice}
        newItemImageUrl={newItemImageUrl}
        setNewItemImageUrl={setNewItemImageUrl}
        addItemError={addItemError}
        addingItem={addingItem}
        onSubmit={handleAddItem}
      />

      <Modal visible={!!disableReasonItem} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={[styles.modalTitle, { color: colors.text }]}>Disable Item</ThemedText>
              <TouchableOpacity
                onPress={() => {
                  setDisableReasonItem(null);
                  setDisableReason("");
                  setDisableReasonError(null);
                }}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              Reason for disabling {disableReasonItem?.name}
            </ThemedText>
            <TextInput
              style={[
                styles.formInput,
                styles.formInputMultiline,
                { color: colors.text, borderColor: colors.border, backgroundColor: colors.background },
              ]}
              placeholder="Out of stock, equipment issue, etc."
              placeholderTextColor={colors.textSecondary}
              value={disableReason}
              onChangeText={setDisableReason}
              multiline
              numberOfLines={3}
              maxLength={250}
            />

            {disableReasonError ? <Text style={styles.addItemError}>{disableReasonError}</Text> : null}

            <View style={styles.modalActionsRow}>
              <AnimatedButton
                style={[styles.modalSecondaryBtn, { borderColor: colors.border }]}
                onPress={() => {
                  setDisableReasonItem(null);
                  setDisableReason("");
                  setDisableReasonError(null);
                }}
              >
                <ThemedText style={[styles.modalSecondaryBtnText, { color: colors.text }]}>Cancel</ThemedText>
              </AnimatedButton>

              <AnimatedButton
                style={[
                  styles.modalPrimaryBtn,
                  { backgroundColor: colors.primary, opacity: disableReason.trim() ? 1 : 0.7 },
                ]}
                onPress={() => {
                  void submitDisableReason();
                }}
                disabled={!disableReason.trim()}
              >
                <ThemedText style={styles.modalPrimaryBtnText}>Disable</ThemedText>
              </AnimatedButton>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
