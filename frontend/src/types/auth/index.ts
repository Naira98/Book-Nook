export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  nationalId: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export interface EmailFormValues {
  email: string;
}

export type ResetPasswordValues = {
  new_password: string;
  confirm_password: string;
};
