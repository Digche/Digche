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

type AdminSettingsFormState = {
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
  avatarSrc: string;
};

type AdminSettingsErrors = Partial<
  Record<keyof AdminSettingsFormState | "avatar", string>
>;

type AdminSettingsTouchedFields = Partial<
  Record<keyof AdminSettingsFormState, boolean>
>;

const initialProfileState: AdminSettingsFormState = {
  firstName: "راضیه",
  lastName: "اسلامی",
  username: "admin_razyeh",
  phone: "09123456789",
  avatarSrc: "/images/avatars/user-2.webp",
};

const allTouchedFields: AdminSettingsTouchedFields = {
  firstName: true,
  lastName: true,
  username: true,
  phone: true,
};

function getFullName(profile: AdminSettingsFormState) {
  return `${profile.firstName} ${profile.lastName}`.trim();
}

function validateAdminSettingsForm(
  form: AdminSettingsFormState
): AdminSettingsErrors {
  const errors: AdminSettingsErrors = {};

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

function isSameProfile(
  form: AdminSettingsFormState,
  savedProfile: AdminSettingsFormState
) {
  return (
    form.firstName === savedProfile.firstName &&
    form.lastName === savedProfile.lastName &&
    form.username === savedProfile.username &&
    form.phone === savedProfile.phone &&
    form.avatarSrc === savedProfile.avatarSrc
  );
}

export function useAdminSettingsForm() {
  const [savedProfile, setSavedProfile] =
    useState<AdminSettingsFormState>(initialProfileState);

  const [form, setForm] = useState<AdminSettingsFormState>(initialProfileState);

  const [touchedFields, setTouchedFields] =
    useState<AdminSettingsTouchedFields>({});

  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const errors = useMemo(() => validateAdminSettingsForm(form), [form]);

  const visibleErrors = useMemo(() => {
    const result: AdminSettingsErrors = {};

    Object.entries(errors).forEach(([field, error]) => {
      const typedField = field as keyof AdminSettingsFormState;

      if (submitAttempted || touchedFields[typedField]) {
        result[typedField] = error;
      }
    });

    if (avatarError) {
      result.avatar = avatarError;
    }

    return result;
  }, [avatarError, errors, submitAttempted, touchedFields]);

  const isFormValid = Object.keys(errors).length === 0 && !avatarError;
  const hasChanges = !isSameProfile(form, savedProfile);
  const canSubmit = hasChanges && isFormValid && !isSubmitting;

  const draftFullName = getFullName(form);
  const savedFullName = getFullName(savedProfile);

  const updateField = (field: keyof AdminSettingsFormState, value: string) => {
    setSuccessMessage("");

    setForm((prevForm) => ({
      ...prevForm,
      [field]: value,
    }));
  };

  const markFieldAsTouched = (field: keyof AdminSettingsFormState) => {
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

  const updateAvatarFromGallery = (avatarSrc: string) => {
    setSuccessMessage("");
    setAvatarError("");
    updateField("avatarSrc", avatarSrc);
  };

  const updateAvatarFromFile = (file: File) => {
    setSuccessMessage("");
    setAvatarError("");

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    const maxSizeInBytes = 2 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setAvatarError("فرمت تصویر باید png، jpg، jpeg یا webp باشد.");
      return;
    }

    if (file.size > maxSizeInBytes) {
      setAvatarError("حجم تصویر نباید بیشتر از ۲ مگابایت باشد.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageSrc = String(reader.result);
      updateField("avatarSrc", imageSrc);
    };

    reader.readAsDataURL(file);
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

    const currentErrors = validateAdminSettingsForm(form);

    if (Object.keys(currentErrors).length > 0 || avatarError || !hasChanges) {
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => {
        window.setTimeout(resolve, 700);
      });

      setSavedProfile(form);
      setSuccessMessage("تغییرات حساب کاربری با موفقیت ذخیره شد.");
      setSubmitAttempted(false);
      setTouchedFields({});
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    savedProfile,
    draftFullName,
    savedFullName,
    visibleErrors,
    hasChanges,
    canSubmit,
    isSubmitting,
    successMessage,
    updateFirstName,
    updateLastName,
    updatePhone,
    updateUsername,
    updateAvatarFromGallery,
    updateAvatarFromFile,
    markFieldAsTouched,
    handleNameKeyDown,
    handlePhoneKeyDown,
    handleUsernameKeyDown,
    handleSubmit,
  };
}