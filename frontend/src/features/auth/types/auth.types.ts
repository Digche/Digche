export type AuthRole = "customer" | "chef" | "admin";

export type AuthFormValues = {
  fullName: string;
  phoneNumber: string;
  role: AuthRole | "";
  password: string;
  confirmPassword: string;
};