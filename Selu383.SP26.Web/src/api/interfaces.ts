export interface LocationDto {
  id: number;
  name: string;
  type: string;
  phone?: string;
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  openingTime?: string;
  closingTime?: string;
  isActive: boolean;
  tableCount?: number;
  managerId?: number;
  managerName?: string;
}

export interface UserDto {
  id: number;
  userName: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  roles: string[];
  loyaltyPoints: number;
}
export interface MenuItem {
  id: number;
  name: string;
  price: number;
  desc: string;
  category: string;
}
export interface CartItem extends MenuItem {
  qty: number;
  note: string;
}
export interface ApiMenuCategoryDto {
  id: number;
  locationIds: number[];
  name: string;
  isSeasonal: boolean;
  isActive: boolean;
}
export interface ApiMenuItemDto {
  id: number;
  categoryId: number;
  name: string;
  description: string | null;
  basePrice: number;
  isAvailable: boolean;
  unavailableReason: string | null;
}

export interface MenuCategory {
  id: number;
  name: string;
  isSeasonal: boolean;
  isActive: boolean;
  items: MenuItem[];
}

export interface MenuCatalog {
  categories: MenuCategory[];
  items: MenuItem[];
  featuredItems: MenuItem[];
  defaultCategory: string;
}
interface ApiOrderItemDto {
  id: number;
  menuItemName: string;
  quantity: number;
  lineTotal: number;
}
export interface ApiOrderDto {
  id: number;
  orderCode: string;
  orderType: string;
  status: string;
  paymentStatus: string;
  orderTime: string;
  total: number;
  items: ApiOrderItemDto[];
  receiptUrl: string | null;
}

export interface OrderSummary {
  id: number;
  orderCode: string;
  orderType: string;
  status: string;
  paymentStatus: string;
  orderTime: string;
  total: number;
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    lineTotal: number;
  }>;
  receiptUrl: string | null;
}
