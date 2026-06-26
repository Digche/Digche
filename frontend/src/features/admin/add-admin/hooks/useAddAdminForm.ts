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
import {
  isDigitKey,
  sanitizePersonalName,
} from "../../utils/personal-name";

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
    errors.phone = "شماره موبایل را وارد کنید.";
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

    const currentErrors = validateAddAdminForm(form);

    if (Object.keys(currentErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => {
        window.setTimeout(resolve, 700);
      });

      setSuccessMessage("اطلاعات ادمین جدید با موفقیت ثبت شد.");
      setForm(initialFormState);
      setTouchedFields({});
      setSubmitAttempted(false);
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
    updateFirstName,
    updateLastName,
    updatePhone,
    updateUsername,
    markFieldAsTouched,
    handleNameKeyDown,
    handlePhoneKeyDown,
    handleUsernameKeyDown,
    handleSubmit,
  };
}