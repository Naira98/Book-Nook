export enum UserStatus {
  ACTIVATED = "ACTIVATED",
  DEACTIVATED = "DEACTIVATED",
  BLOCKED = "BLOCKED",
}

export enum UserRole {
  MANAGER = "MANAGER",
  CLIENT = "CLIENT",
  EMPLOYEE = "EMPLOYEE",
  COURIER = "COURIER",
}

export interface IUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  wallet: number;
  role: UserRole;
  interests: string | null;
}
