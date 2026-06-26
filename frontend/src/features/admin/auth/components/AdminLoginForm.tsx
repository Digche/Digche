"use client";

import type { FormEventHandler } from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthCodeInput } from "@/features/auth/components/AuthCodeInput";
import { AuthPhoneNumberInput } from "@/features/auth/components/AuthPhoneNumberInput";
import { isValidIranMobileNumber } from "@/shared/validation/phone-number";
import {
  getAdminAuthErrorMessage,
  requestAdminOtp,
  verifyAdminOtp,
} from "../services/admin-auth-api";
import { useAdminAuthStore } from "../store/admin-auth-store";
import styles from "@/features/auth/components/AuthPage.module.css";

type AdminLoginStep = "phone" | "verification";

function isValidVerificationCode(value: string) {
  return /^\d{4,6}$/.test(value);
}

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAdminAuthStore((state) => state.setSession);

  const [step, setStep] = useState<AdminLoginStep>("phone");
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isPhoneStep = step === "phone";
  const isVerificationStep = step === "verification";

  const title = isPhoneStep ? "ورود ادمین" : "کد تایید";
  const subtitle = isPhoneStep
    ? "شماره موبایل ادمین خود را وارد کنید."
    : "کد پیامک‌شده برای ورود به پنل ادمین را وارد کنید.";

  const submitText = isSubmitting
    ? "در حال ارسال..."
    : isPhoneStep
      ? "ورود"
      : "تایید";

  function getRedirectPath() {
    const nextPath = searchParams.get("next");

    if (
      nextPath &&
      (nextPath === "/admin" || nextPath.startsWith("/admin/")) &&
      !nextPath.startsWith("//")
    ) {
      return nextPath;
    }

    return "/admin/dashboard";
  }

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (isPhoneStep) {
      await submitPhoneStep();
      return;
    }

    await submitVerificationStep();
  };

  async function submitPhoneStep() {
    if (!isValidIranMobileNumber(phone)) {
      setErrorMessage("شماره موبایل معتبر نیست.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      await requestAdminOtp({
        phone,
      });

      setVerificationCode("");
      setStep("verification");
    } catch (error) {
      setErrorMessage(getAdminAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitVerificationStep() {
    if (!isValidVerificationCode(verificationCode)) {
      setErrorMessage("کد تایید باید بین ۴ تا ۶ رقم باشد.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const session = await verifyAdminOtp({
        phone,
        code: verificationCode,
      });

      setSession(session);
      router.replace(getRedirectPath());
    } catch (error) {
      setErrorMessage(getAdminAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleChangePhone() {
    setStep("phone");
    setVerificationCode("");
    setErrorMessage("");
  }

  return (
    <form className={styles.form} dir="rtl" onSubmit={handleSubmit}>
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>{title}</h2>
        <p className={styles.formSubtitle}>{subtitle}</p>
      </div>

      <div className={styles.fields}>
        {isPhoneStep && (
          <AuthPhoneNumberInput
            label="شماره تماس ادمین"
            name="adminPhoneNumber"
            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
            required
            disabled={isSubmitting}
            value={phone}
            onValueChange={setPhone}
          />
        )}

        {isVerificationStep && (
          <AuthCodeInput
            label="کد تایید"
            name="adminVerificationCode"
            placeholder="۱۲۳۴۵۶"
            required
            disabled={isSubmitting}
            value={verificationCode}
            onValueChange={setVerificationCode}
          />
        )}
      </div>

      {isVerificationStep && (
        <p className={styles.authFooter}>
          شماره اشتباه است؟

          <button
            className={styles.footerAction}
            type="button"
            disabled={isSubmitting}
            onClick={handleChangePhone}
          >
            تغییر شماره
          </button>
        </p>
      )}

      {errorMessage && (
        <p
          role="alert"
          className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-center text-sm font-bold leading-7 text-red-600"
        >
          {errorMessage}
        </p>
      )}

      <button
        className={styles.submitButton}
        type="submit"
        disabled={isSubmitting}
      >
        {submitText}
      </button>

      <p className={styles.authFooter}>
        ورود فقط برای ادمین‌های فعال دیگچه مجاز است.
      </p>
    </form>
  );
}
