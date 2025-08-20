export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  first_name: string;
  last_name: string;
  email: string;
  national_id: string;
  phone_number: string;
  password: string;
  confirmPassword: string;
}

export interface AddNewUserFormValues {
  firstName: string;
  lastName: string;
  email: string;
  nationalId: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  role:string;
}
export interface EmailFormValues {
  email: string;
}

export type ResetPasswordValues = {
  new_password: string;
  confirm_password: string;
};
