const UserStatus = {
  Activated: 1,
  Deactivated: 2,
  Blocked: 3,
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

const UserRole = {
  Manager: 1,
  Client: 2,
  Employee: 3,
  Courier: 4,
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

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
