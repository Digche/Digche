"use client";

import type { FormEvent, KeyboardEvent } from "react";
import { useEffect, useMemo, useState } from "react";
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
import type { AdminApiUser } from "../../auth/types/admin-auth.types";
import { useAdminAuthStore } from "../../auth/store/admin-auth-store";
import { isDigitKey, sanitizePersonalName } from "../../utils/personal-name";
import {
  fetchAdminSettingsProfile,
  requestCurrentAdminPhoneChangeCode,
  updateCurrentAdminFirstName,
  updateCurrentAdminLastName,
  updateCurrentAdminPhotoUrl,
  updateCurrentAdminUsername,
  verifyCurrentAdminPhoneChange,
} from "../services/admin-settings-api";

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

const DEFAULT_ADMIN_AVATAR = "/images/avatars/user-2.webp";

const emptyProfileState: AdminSettingsFormState = {
  firstName: "",
  lastName: "",
  username: "",
  phone: "",
  avatarSrc: DEFAULT_ADMIN_AVATAR,
};

const allTouchedFields: AdminSettingsTouchedFields = {
  firstName: true,
  lastName: true,
  username: true,
  phone: true,
};

function toLocalIranMobileNumber(value: string) {
  const digits = String(value || "").replace(/\D/g, "");

  if (digits.startsWith("0098") && digits.length === 14) {
    return `0${digits.slice(4)}`;
  }

  if (digits.startsWith("98") && digits.length === 12) {
    return `0${digits.slice(2)}`;
  }

  if (digits.startsWith("9") && digits.length === 10) {
    return `0${digits}`;
  }

  return digits;
}

function toFormState(admin: AdminApiUser): AdminSettingsFormState {
  return {
    firstName: admin.firstName ?? "",
    lastName: admin.lastName ?? "",
    username: admin.username ?? "",
    phone: toLocalIranMobileNumber(admin.phone),
    avatarSrc: admin.photoUrl || DEFAULT_ADMIN_AVATAR,
  };
}

function getFullName(profile: AdminSettingsFormState) {
  return `${profile.firstName} ${profile.lastName}`.trim();
}

function getPersistablePhotoUrl(avatarSrc: string) {
  const value = avatarSrc.trim();

  if (!value || value.startsWith("/")) {
    return null;
  }

  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? value : null;
  } catch {
    return null;
  }
}

function validateAdminSettingsForm(
  form: AdminSettingsFormState
): AdminSettingsErrors {
  const errors: AdminSettingsErrors = {};
  const firstName = form.firstName.trim();
  const lastName = form.lastName.trim();
  const username = form.username.trim();
  const phone = form.phone.trim();

  if (!firstName) errors.firstName = "نام را وارد کنید.";
  if (!lastName) errors.lastName = "نام خانوادگی را وارد کنید.";

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
  const currentAdmin = useAdminAuthStore((state) => state.currentAdmin);
  const applyProfileUpdate = useAdminAuthStore(
    (state) => state.applyProfileUpdate
  );
  const setAdminSession = useAdminAuthStore((state) => state.setSession);
  const canEditPhone = Boolean(currentAdmin?.isManager);

  const initialProfile = currentAdmin
    ? toFormState(currentAdmin)
    : emptyProfileState;

  const [savedProfile, setSavedProfile] =
    useState<AdminSettingsFormState>(initialProfile);
  const [form, setForm] = useState<AdminSettingsFormState>(initialProfile);
  const [touchedFields, setTouchedFields] =
    useState<AdminSettingsTouchedFields>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [phoneEditRestrictionMessage, setPhoneEditRestrictionMessage] =
    useState("");

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
  const [verifiedPhoneForSave, setVerifiedPhoneForSave] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadProfile() {
      try {
        setIsLoadingProfile(true);
        setLoadError("");

        const response = await fetchAdminSettingsProfile();
        const nextProfile = toFormState(response.admin);

        if (!ignore) {
          setSavedProfile(nextProfile);
          setForm(nextProfile);
          setTouchedFields({});
          setSubmitAttempted(false);
          setVerifiedPhoneForSave("");
        }
      } catch (error) {
        if (!ignore) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "اطلاعات حساب ادمین دریافت نشد."
          );
        }
      } finally {
        if (!ignore) setIsLoadingProfile(false);
      }
    }

    loadProfile();

    return () => {
      ignore = true;
    };
  }, []);

  const errors = useMemo(() => validateAdminSettingsForm(form), [form]);

  const visibleErrors = useMemo(() => {
    const result: AdminSettingsErrors = {};

    Object.entries(errors).forEach(([field, error]) => {
      const typedField = field as keyof AdminSettingsFormState;

      if (submitAttempted || touchedFields[typedField]) {
        result[typedField] = error;
      }
    });

    if (avatarError) result.avatar = avatarError;
    return result;
  }, [avatarError, errors, submitAttempted, touchedFields]);

  const isFormValid = Object.keys(errors).length === 0 && !avatarError;
  const hasChanges = !isSameProfile(form, savedProfile);
  const canSubmit = hasChanges && isFormValid && !isSubmitting && !isLoadingProfile;

  const draftFullName = getFullName(form);
  const savedFullName = getFullName(savedProfile);

  const updateField = (field: keyof AdminSettingsFormState, value: string) => {
    setSuccessMessage("");
    setSubmitError("");

    if (field !== "phone") {
      setPhoneEditRestrictionMessage("");
    }

    setForm((prevForm) => ({ ...prevForm, [field]: value }));
  };

  const markFieldAsTouched = (field: keyof AdminSettingsFormState) => {
    setTouchedFields((prevTouchedFields) => ({
      ...prevTouchedFields,
      [field]: true,
    }));
  };

  const updateFirstName = (value: string) =>
    updateField("firstName", sanitizePersonalName(value));

  const updateLastName = (value: string) =>
    updateField("lastName", sanitizePersonalName(value));

  const updateUsername = (value: string) =>
    updateField("username", sanitizeUsername(value));

  const showPhoneEditRestriction = () => {
    if (canEditPhone) return;

    setPhoneEditRestrictionMessage(
      "امکان ویرایش شماره موبایل توسط شما وجود ندارد. به منیجر درخواست ویرایش شماره موبایل دهید."
    );
  };

  const updatePhone = (value: string) => {
    setPendingPhone(sanitizePhoneNumber(value));
  };

  const openPhoneVerification = () => {
    if (!canEditPhone) {
      showPhoneEditRestriction();
      return;
    }

    setPendingPhone(form.phone);
    setPhoneVerificationCode("");
    setPhoneVerificationStep("phone");
    setPhoneVerificationError("");
    setPhoneVerificationResultStatus("idle");
    setPhoneVerificationResultMessage("");
    setIsPhoneModalOpen(true);
  };

  const updateAvatarFromGallery = (avatarSrc: string) => {
    setSuccessMessage("");
    setSubmitError("");
    setAvatarError("");
    updateField("avatarSrc", avatarSrc);
  };

  const updateAvatarFromFile = (file: File) => {
    setSuccessMessage("");
    setSubmitError("");
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
    reader.onload = () => updateField("avatarSrc", String(reader.result));
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

    if (!isShortcutKey && !isControlKey && !toEnglishDigit(event.key)) {
      event.preventDefault();
    }
  };

  const handleUsernameKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const isShortcutKey = event.ctrlKey || event.metaKey || event.altKey;
    const isControlKey = event.key.length !== 1;

    if (!isShortcutKey && !isControlKey && !isAllowedUsernameValue(event.key)) {
      event.preventDefault();
    }
  };

  const requestPhoneVerificationCode = async () => {
    if (!canEditPhone) {
      showPhoneEditRestriction();
      return;
    }

    if (!isValidIranMobileNumber(pendingPhone)) {
      setPhoneVerificationError("شماره موبایل معتبر نیست.");
      return;
    }

    if (pendingPhone === savedProfile.phone) {
      setPhoneVerificationError("شماره جدید باید با شماره فعلی متفاوت باشد.");
      return;
    }

    try {
      setIsPhoneVerificationSubmitting(true);
      setPhoneVerificationError("");
      setPhoneVerificationResultStatus("idle");
      setPhoneVerificationResultMessage("");

      await requestCurrentAdminPhoneChangeCode(pendingPhone);

      setPhoneVerificationCode("");
      setPhoneVerificationStep("verification");
    } catch (error) {
      setPhoneVerificationError(
        error instanceof Error ? error.message : "ارسال کد تایید انجام نشد."
      );
    } finally {
      setIsPhoneVerificationSubmitting(false);
    }
  };

  const closePhoneVerification = () => {
    if (isPhoneVerificationSubmitting) return;

    setIsPhoneModalOpen(false);
    setPhoneVerificationCode("");
    setPhoneVerificationError("");
    setPhoneVerificationResultStatus("idle");
    setPhoneVerificationResultMessage("");
  };

  const verifyPhoneVerificationCode = async () => {
    const code = phoneVerificationCode.trim();

    if (!/^\d{4,6}$/.test(code)) {
      setPhoneVerificationError("کد تایید باید بین ۴ تا ۶ رقم باشد.");
      return;
    }

    try {
      setIsPhoneVerificationSubmitting(true);
      setPhoneVerificationError("");
      setPhoneVerificationResultStatus("idle");

      const session = await verifyCurrentAdminPhoneChange(pendingPhone, code);
      setAdminSession(session);

      const nextProfile = toFormState(session.admin);

      setForm((prevForm) => ({
        ...prevForm,
        phone: nextProfile.phone,
      }));
      setVerifiedPhoneForSave(nextProfile.phone);
      setPhoneVerificationResultStatus("success");
      setPhoneVerificationResultMessage(
        "شماره جدید تایید شد. حالا برای ثبت نهایی روی ذخیره تغییرات بزنید."
      );
      setSubmitAttempted(false);
      setTouchedFields((prevTouchedFields) => ({
        ...prevTouchedFields,
        phone: false,
      }));
    } catch (error) {
      setPhoneVerificationResultStatus("error");
      setPhoneVerificationError(
        error instanceof Error ? error.message : "تایید شماره جدید انجام نشد."
      );
    } finally {
      setIsPhoneVerificationSubmitting(false);
    }
  };

  const backToPhoneStep = () => {
    if (isPhoneVerificationSubmitting) return;

    setPhoneVerificationStep("phone");
    setPhoneVerificationCode("");
    setPhoneVerificationError("");
    setPhoneVerificationResultStatus("idle");
    setPhoneVerificationResultMessage("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSubmitAttempted(true);
    setTouchedFields(allTouchedFields);
    setSuccessMessage("");
    setSubmitError("");

    const currentErrors = validateAdminSettingsForm(form);
    if (Object.keys(currentErrors).length > 0 || avatarError || !hasChanges) return;

    if (form.phone !== savedProfile.phone && form.phone !== verifiedPhoneForSave) {
      openPhoneVerification();
      return;
    }

    setIsSubmitting(true);

    try {
      let latestUpdate = null;

      if (form.firstName !== savedProfile.firstName) {
        latestUpdate = await updateCurrentAdminFirstName(form.firstName.trim());
      }

      if (form.lastName !== savedProfile.lastName) {
        latestUpdate = await updateCurrentAdminLastName(form.lastName.trim());
      }

      if (form.username !== savedProfile.username) {
        latestUpdate = await updateCurrentAdminUsername(form.username.trim());
      }

      const nextPhotoUrl = getPersistablePhotoUrl(form.avatarSrc);
      const savedPhotoUrl = getPersistablePhotoUrl(savedProfile.avatarSrc);

      if (form.avatarSrc !== savedProfile.avatarSrc && nextPhotoUrl !== savedPhotoUrl) {
        if (!nextPhotoUrl && form.avatarSrc !== DEFAULT_ADMIN_AVATAR) {
          setAvatarError("برای ذخیره عکس در بک‌اند باید آدرس http/https داشته باشد.");
          return;
        }

        latestUpdate = await updateCurrentAdminPhotoUrl(nextPhotoUrl);
      }

      if (latestUpdate) {
        applyProfileUpdate(latestUpdate);
      }

      setSavedProfile(form);
      setVerifiedPhoneForSave("");
      setSuccessMessage("تغییرات حساب کاربری با موفقیت ذخیره شد.");
      setSubmitAttempted(false);
      setTouchedFields({});
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "ذخیره تغییرات حساب کاربری انجام نشد."
      );
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
    isLoadingProfile,
    isSubmitting,
    loadError,
    submitError,
    successMessage,
    canEditPhone,
    phoneEditRestrictionMessage,
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
    updateAvatarFromGallery,
    updateAvatarFromFile,
    updatePhoneVerificationCode: setPhoneVerificationCode,
    openPhoneVerification,
    requestPhoneVerificationCode,
    closePhoneVerification,
    verifyPhoneVerificationCode,
    backToPhoneStep,
    showPhoneEditRestriction,
    markFieldAsTouched,
    handleNameKeyDown,
    handlePhoneKeyDown,
    handleUsernameKeyDown,
    handleSubmit,
  };
}
