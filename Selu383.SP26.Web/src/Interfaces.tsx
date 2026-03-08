export interface LocationInterface {
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
  layoutJson?: string;
  isActive: boolean;
  tableCount: number;
  managerId?: number;
  manager?: UserInterface;
}

export interface UserInterface {
  id: number;
  userName: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  roles: string[];
}

export interface RoleInterface {
  id: number;
  name: string;
}

export interface MenuItemInterface {
  id: number;
  categoryId: number;
  category?: MenuCategoryInterface;
  name: string;
  description?: string;
  basePrice: number;
  isAvailable: boolean;
}

export interface MenuCategoryInterface {
  id: number;
  locationId: number;
  name: string;
  isSeasonal: boolean;
  isActive: boolean;
  menuItems?: MenuItemInterface[];
}
