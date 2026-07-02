"use client";

import type { FormEvent, KeyboardEvent } from "react";
import { useMemo, useState } from "react";
import {
  isValidIranMobileNumber,
  sanitizePhoneNumber,
  toEnglishDigit,
} from "@/shared/validation/phone-number";
import {
  isAllowedUsernameValue,
  isValidUsername,
  sanitizeUsername,
} from "@/shared/validation/username";
import type {
  PhoneVerificationResultStatus,
  PhoneVerificationStep,
} from "@/shared/ui/PhoneVerificationGlassBox";
import {
  isDigitKey,
  sanitizePersonalName,
} from "../../utils/personal-name";
import {
  createAdminUser,
  requestNewAdminPhoneCode,
  verifyNewAdminPhoneCode,
} from "../../services/admin-dashboard-api";

type AddAdminFormState = {
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
};

type AddAdminFormErrors = Partial<Record<keyof AddAdminFormState, string>>;

type AddAdminTouchedFields = Partial<Record<keyof AddAdminFormState, boolean>>;

const initialFormState: AddAdminFormState = {
  firstName: "",
  lastName: "",
  username: "",
  phone: "",
};

const allTouchedFields: AddAdminTouchedFields = {
  firstName: true,
  lastName: true,
  username: true,
  phone: true,
};

function validateAddAdminForm(form: AddAdminFormState): AddAdminFormErrors {
  const errors: AddAdminFormErrors = {};

  const firstName = form.firstName.trim();
  const lastName = form.lastName.trim();
  const username = form.username.trim();
  const phone = form.phone.trim();

  if (!firstName) {
    errors.firstName = "نام را وارد کنید.";
  }

  if (!lastName) {
    errors.lastName = "نام خانوادگی را وارد کنید.";
  }

  if (!phone) {
    errors.phone = "شماره موبایل را تایید کنید.";
  } else if (!phone.startsWith("09")) {
    errors.phone = "شماره موبایل باید با 09 شروع شود.";
  } else if (phone.length !== 11) {
    errors.phone = "شماره موبایل باید دقیقاً ۱۱ رقم باشد.";
  } else if (!isValidIranMobileNumber(phone)) {
    errors.phone = "فرمت شماره موبایل معتبر نیست.";
  }

  if (!username) {
    errors.username = "نام کاربری را وارد کنید.";
  } else if (!isValidUsername(username)) {
    errors.username =
      "نام کاربری باید ۳ تا ۵۰ کاراکتر و فقط شامل حروف انگلیسی، عدد انگلیسی و آندرلاین باشد.";
  }

  return errors;
}

export function useAddAdminForm() {
  const [form, setForm] = useState<AddAdminFormState>(initialFormState);
  const [touchedFields, setTouchedFields] = useState<AddAdminTouchedFields>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [phoneVerificationStep, setPhoneVerificationStep] =
    useState<PhoneVerificationStep>("phone");
  const [pendingPhone, setPendingPhone] = useState("");
  const [phoneVerificationCode, setPhoneVerificationCode] = useState("");
  const [isPhoneVerificationSubmitting, setIsPhoneVerificationSubmitting] =
    useState(false);
  const [phoneVerificationError, setPhoneVerificationError] = useState("");
  const [phoneVerificationResultStatus, setPhoneVerificationResultStatus] =
    useState<PhoneVerificationResultStatus>("idle");
  const [phoneVerificationResultMessage, setPhoneVerificationResultMessage] =
    useState("");

  const errors = useMemo(() => validateAddAdminForm(form), [form]);

  const visibleErrors = useMemo(() => {
    const result: AddAdminFormErrors = {};

    Object.entries(errors).forEach(([field, error]) => {
      const typedField = field as keyof AddAdminFormState;

      if (submitAttempted || touchedFields[typedField]) {
        result[typedField] = error;
      }
    });

    return result;
  }, [errors, submitAttempted, touchedFields]);

  const isFormValid = Object.keys(errors).length === 0;

  const updateField = (field: keyof AddAdminFormState, value: string) => {
    setSuccessMessage("");
    setSubmitError("");

    setForm((prevForm) => ({
      ...prevForm,
      [field]: value,
    }));
  };

  const markFieldAsTouched = (field: keyof AddAdminFormState) => {
    setTouchedFields((prevTouchedFields) => ({
      ...prevTouchedFields,
      [field]: true,
    }));
  };

  const updateFirstName = (value: string) => {
    updateField("firstName", sanitizePersonalName(value));
  };

  const updateLastName = (value: string) => {
    updateField("lastName", sanitizePersonalName(value));
  };

  const updatePhone = (value: string) => {
    updateField("phone", sanitizePhoneNumber(value));
  };

  const updateUsername = (value: string) => {
    updateField("username", sanitizeUsername(value));
  };

  const openPhoneVerification = () => {
    setPendingPhone(form.phone);
    setPhoneVerificationCode("");
    setPhoneVerificationStep("phone");
    setPhoneVerificationError("");
    setPhoneVerificationResultStatus("idle");
    setPhoneVerificationResultMessage("");
    setIsPhoneModalOpen(true);
    markFieldAsTouched("phone");
  };

  const closePhoneVerification = () => {
    if (isPhoneVerificationSubmitting) {
      return;
    }

    setIsPhoneModalOpen(false);
    setPhoneVerificationStep("phone");
    setPhoneVerificationCode("");
    setPhoneVerificationError("");
    setPhoneVerificationResultStatus("idle");
    setPhoneVerificationResultMessage("");
  };

  const requestPhoneVerificationCode = async () => {
    const normalizedPhone = sanitizePhoneNumber(pendingPhone);

    if (!isValidIranMobileNumber(normalizedPhone)) {
      setPhoneVerificationError("شماره موبایل معتبر نیست.");
      return;
    }

    setIsPhoneVerificationSubmitting(true);
    setPhoneVerificationError("");
    setPhoneVerificationResultStatus("idle");
    setPhoneVerificationResultMessage("");

    try {
      await requestNewAdminPhoneCode(normalizedPhone);
      setPendingPhone(normalizedPhone);
      setPhoneVerificationCode("");
      setPhoneVerificationStep("verification");
    } catch (error) {
      setPhoneVerificationError(
        error instanceof Error
          ? error.message
          : "ارسال کد تایید انجام نشد."
      );
    } finally {
      setIsPhoneVerificationSubmitting(false);
    }
  };

  const verifyPhoneVerificationCode = async () => {
    const normalizedPhone = sanitizePhoneNumber(pendingPhone);
    const normalizedCode = phoneVerificationCode.trim();

    if (!/^\d{4,6}$/.test(normalizedCode)) {
      setPhoneVerificationError("کد تایید باید بین ۴ تا ۶ رقم باشد.");
      return;
    }

    setIsPhoneVerificationSubmitting(true);
    setPhoneVerificationError("");
    setPhoneVerificationResultStatus("idle");
    setPhoneVerificationResultMessage("");

    try {
      const result = await verifyNewAdminPhoneCode(
        normalizedPhone,
        normalizedCode
      );

      updatePhone(result.phone);
      setPhoneVerificationResultStatus("success");
      setPhoneVerificationResultMessage("شماره ادمین جدید با موفقیت تایید شد.");
    } catch (error) {
      setPhoneVerificationResultStatus("error");
      setPhoneVerificationResultMessage(
        error instanceof Error
          ? error.message
          : "تایید شماره انجام نشد. دوباره تلاش کنید."
      );
    } finally {
      setIsPhoneVerificationSubmitting(false);
    }
  };

  const handleNameKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const isShortcutKey = event.ctrlKey || event.metaKey || event.altKey;
    const isControlKey = event.key.length !== 1;

    if (!isShortcutKey && !isControlKey && isDigitKey(event.key)) {
      event.preventDefault();
    }
  };

  const handlePhoneKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const isShortcutKey = event.ctrlKey || event.metaKey || event.altKey;
    const isControlKey = event.key.length !== 1;

    if (!isShortcutKey && !isControlKey) {
      const englishDigit = toEnglishDigit(event.key);

      if (!englishDigit) {
        event.preventDefault();
      }
    }
  };

  const handleUsernameKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const isShortcutKey = event.ctrlKey || event.metaKey || event.altKey;
    const isControlKey = event.key.length !== 1;

    if (!isShortcutKey && !isControlKey) {
      const isValidCharacter = isAllowedUsernameValue(event.key);

      if (!isValidCharacter) {
        event.preventDefault();
      }
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSubmitAttempted(true);
    setTouchedFields(allTouchedFields);
    setSuccessMessage("");
    setSubmitError("");

    const currentErrors = validateAddAdminForm(form);

    if (Object.keys(currentErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createAdminUser({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        username: form.username.trim(),
        phone: form.phone.trim(),
      });

      setSuccessMessage("اطلاعات ادمین جدید با موفقیت ثبت شد.");
      setForm(initialFormState);
      setTouchedFields({});
      setSubmitAttempted(false);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "افزودن ادمین انجام نشد. دوباره تلاش کنید."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    visibleErrors,
    isFormValid,
    isSubmitting,
    successMessage,
    submitError,
    isPhoneModalOpen,
    phoneVerificationStep,
    pendingPhone,
    phoneVerificationCode,
    isPhoneVerificationSubmitting,
    phoneVerificationError,
    phoneVerificationResultStatus,
    phoneVerificationResultMessage,
    updateFirstName,
    updateLastName,
    updatePhone,
    updateUsername,
    updatePendingPhone: setPendingPhone,
    updatePhoneVerificationCode: setPhoneVerificationCode,
    markFieldAsTouched,
    openPhoneVerification,
    closePhoneVerification,
    requestPhoneVerificationCode,
    verifyPhoneVerificationCode,
    handleNameKeyDown,
    handlePhoneKeyDown,
    handleUsernameKeyDown,
    handleSubmit,
  };
}
