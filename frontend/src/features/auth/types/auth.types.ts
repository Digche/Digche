import { AUTH_ROLE_OPTIONS } from "../constants/auth-role-options";

export type AuthRole = (typeof AUTH_ROLE_OPTIONS)[number]["value"];

export type AuthMode = "login" | "signup";

export type AuthStep = "phone" | "verification" | "profile";

export type AuthFormValues = {
  phoneNumber: string;
  verificationCode: string;
  firstName: string;
  lastName: string;
  username: string;
};