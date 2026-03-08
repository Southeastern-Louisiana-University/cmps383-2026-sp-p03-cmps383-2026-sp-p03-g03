export interface LocationInterface {
  id: number;
  name: string;
  type: string;
  phoneNumber?: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  openingTime?: string;
  closingTime?: string;
  layout?: string;
  isActive: boolean;
  tableCount: number;
  managerId?: string;
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