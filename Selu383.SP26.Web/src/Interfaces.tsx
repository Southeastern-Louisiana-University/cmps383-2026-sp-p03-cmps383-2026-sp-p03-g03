export interface LocationInterface {
  id: number;
  name: string;
  address: string;
  tableCount: number;
  managerId: string;
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