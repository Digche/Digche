"use client";

import { create } from "zustand";
import type {
  AuthFormValues,
  AuthMode,
  AuthRole,
  AuthStep,
} from "../types/auth.types";

type AuthFormField = keyof AuthFormValues;

type AuthStore = {
  mode: AuthMode;
  step: AuthStep;
  role: AuthRole;
  form: AuthFormValues;

  setMode: (mode: AuthMode) => void;
  setStep: (step: AuthStep) => void;
  setRole: (role: AuthRole) => void;
  setField: <Field extends AuthFormField>(
    field: Field,
    value: AuthFormValues[Field]
  ) => void;
  resetForm: () => void;
};

const initialFormValues: AuthFormValues = {
  phoneNumber: "",
  verificationCode: "",
  firstName: "",
  lastName: "",
  username: "",
};

export const useAuthStore = create<AuthStore>((set) => ({
  mode: "login",
  step: "phone",
  role: "customer",
  form: initialFormValues,

  setMode: (mode) =>
    set({
      mode,
      step: "phone",
      form: initialFormValues,
    }),

  setStep: (step) => set({ step }),

  setRole: (role) => set({ role }),

  setField: (field, value) =>
    set((state) => ({
      form: {
        ...state.form,
        [field]: value,
      },
    })),

  resetForm: () =>
    set({
      mode: "login",
      step: "phone",
      role: "customer",
      form: initialFormValues,
    }),
}));