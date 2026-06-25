"use client";

import { create } from "zustand";
import type {
  AuthFormValues,
  AuthMode,
  AuthRole,
  AuthStep,
} from "../types/auth.types";

type AuthFormField = keyof AuthFormValues;

export type AuthFormStore = {
  mode: AuthMode;
  step: AuthStep;
  role: AuthRole;
  form: AuthFormValues;
  registrationToken: string | null;
  isSubmitting: boolean;
  errorMessage: string;

  setMode: (mode: AuthMode) => void;
  setStep: (step: AuthStep) => void;
  setRole: (role: AuthRole) => void;
  setRegistrationToken: (registrationToken: string | null) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  setErrorMessage: (message: string) => void;
  clearErrorMessage: () => void;
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

export const useAuthFormStore = create<AuthFormStore>((set) => ({
  mode: "login",
  step: "phone",
  role: "customer",
  form: initialFormValues,
  registrationToken: null,
  isSubmitting: false,
  errorMessage: "",

  setMode: (mode) =>
    set({
      mode,
      step: "phone",
      form: initialFormValues,
      registrationToken: null,
      errorMessage: "",
    }),

  setStep: (step) => set({ step, errorMessage: "" }),

  setRole: (role) =>
    set({
      role,
      step: "phone",
      form: initialFormValues,
      registrationToken: null,
      errorMessage: "",
    }),

  setRegistrationToken: (registrationToken) => set({ registrationToken }),

  setSubmitting: (isSubmitting) => set({ isSubmitting }),

  setErrorMessage: (errorMessage) => set({ errorMessage }),

  clearErrorMessage: () => set({ errorMessage: "" }),

  setField: (field, value) =>
    set((state) => ({
      form: {
        ...state.form,
        [field]: value,
      },
      errorMessage: "",
    })),

  resetForm: () =>
    set({
      mode: "login",
      step: "phone",
      role: "customer",
      form: initialFormValues,
      registrationToken: null,
      isSubmitting: false,
      errorMessage: "",
    }),
}));

export const useAuthStore = useAuthFormStore;