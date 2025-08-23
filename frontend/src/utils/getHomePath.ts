import { UserRole } from "../types/User";

export const getHomePath = (
  role: UserRole,
  userInterests: string | null,
): string => {
  if (role === UserRole.EMPLOYEE) return "/staff/books";
  else if (role === UserRole.COURIER) return "/courier/orders";
  else if (role === UserRole.MANAGER) return "/staff/books";
  else if (role === UserRole.CLIENT && !userInterests) return "/interests";
  else return "/";
};
