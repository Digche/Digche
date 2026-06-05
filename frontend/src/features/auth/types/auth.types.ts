export type AuthRole = "customer" | "chef" | "admin";

export type AuthFormValues = {
  username: string;
  phoneNumber: string;
  role: AuthRole | "";
  password: string;
  confirmPassword: string;
};