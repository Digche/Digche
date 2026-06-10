"use client";

import type { FormEvent } from "react";
import { AuthCodeInput } from "./AuthCodeInput";
import { AuthInput } from "./AuthInput";
import { AuthPhoneNumberInput } from "./AuthPhoneNumberInput";
import { AuthRoleSelect } from "./AuthRoleSelect";
import { AuthUsernameInput } from "./AuthUsernameInput";
import { useAuthStore } from "../store/auth.store";
import { isValidIranMobileNumber } from "../utils/phone-number";
import { isValidVerificationCode } from "../utils/verification-code";
import styles from "./AuthPage.module.css";

export function AuthForm() {
  const mode = useAuthStore((state) => state.mode);
  const step = useAuthStore((state) => state.step);
  const role = useAuthStore((state) => state.role);
  const form = useAuthStore((state) => state.form);
  const setMode = useAuthStore((state) => state.setMode);
  const setStep = useAuthStore((state) => state.setStep);
  const setRole = useAuthStore((state) => state.setRole);
  const setField = useAuthStore((state) => state.setField);

  const isLogin = mode === "login";
  const isPhoneStep = step === "phone";
  const isVerificationStep = step === "verification";
  const isProfileStep = step === "profile";

  const title = getFormTitle();
  const subtitle = getFormSubtitle();
  const submitText = getSubmitText();

  function getFormTitle() {
    if (isVerificationStep) {
      return "کد تایید";
    }

    if (isProfileStep) {
      return "ثبت نام";
    }

    return isLogin ? "ورود" : "ثبت نام";
  }

  function getFormSubtitle() {
    if (isVerificationStep) {
      return "لطفاً کد پیامک شده را وارد کنید.";
    }

    if (isProfileStep) {
      return "اطلاعات کاربری خود را تکمیل کنید.";
    }

    return "لطفاً شماره تماس خود را وارد کنید.";
  }

  function getSubmitText() {
    if (isProfileStep) {
      return "ثبت نام";
    }

    if (isVerificationStep || !isLogin) {
      return "تایید";
    }

    return "ورود";
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isPhoneStep) {
      if (!isValidIranMobileNumber(form.phoneNumber)) {
        alert("شماره تماس معتبر نیست.");
        return;
      }

      setStep("verification");
      return;
    }

    if (isVerificationStep) {
      if (!isValidVerificationCode(form.verificationCode)) {
        alert("کد تایید باید بین ۴ تا ۶ رقم باشد.");
        return;
      }

      if (isLogin) {
        console.log("digcheh login:", {
          role,
          phoneNumber: form.phoneNumber,
          verificationCode: form.verificationCode,
        });

        return;
      }

      setStep("profile");
      return;
    }

    if (isProfileStep) {
      if (!form.firstName.trim()) {
        alert("نام را وارد کنید.");
        return;
      }

      if (!form.lastName.trim()) {
        alert("نام خانوادگی را وارد کنید.");
        return;
      }

      if (!form.username.trim()) {
        alert("نام کاربری را وارد کنید.");
        return;
      }

      console.log("digcheh signup:", {
        role,
        ...form,
      });
    }
  }

  function switchToLogin() {
    setMode("login");
  }

  function switchToSignup() {
    setMode("signup");
  }

  return (
    <form className={styles.form} dir="rtl" onSubmit={handleSubmit}>
      <AuthRoleSelect value={role} onChange={setRole} />

      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>{title}</h2>
        <p className={styles.formSubtitle}>{subtitle}</p>
      </div>

      <div className={styles.fields}>
        {isPhoneStep ? (
          <AuthPhoneNumberInput
            label="شماره تماس"
            name="phoneNumber"
            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
            required
            value={form.phoneNumber}
            onValueChange={(value) => setField("phoneNumber", value)}
          />
        ) : null}

        {isVerificationStep ? (
          <AuthCodeInput
            label="کد تایید"
            name="verificationCode"
            placeholder="۱۲۳۴۵۶"
            required
            value={form.verificationCode}
            onValueChange={(value) => setField("verificationCode", value)}
          />
        ) : null}

        {isProfileStep ? (
          <>
            <AuthInput
              label="نام"
              name="firstName"
              placeholder="مطهره"
              required
              value={form.firstName}
              onChange={(event) => setField("firstName", event.target.value)}
            />

            <AuthInput
              label="نام خانوادگی"
              name="lastName"
              placeholder="رحمانی"
              required
              value={form.lastName}
              onChange={(event) => setField("lastName", event.target.value)}
            />

            <AuthUsernameInput
              label="نام کاربری"
              name="username"
              placeholder="Motirahmani"
              required
              value={form.username}
              onValueChange={(value) => setField("username", value)}
            />
          </>
        ) : null}
      </div>

      <button className={styles.submitButton} type="submit">
        {submitText}
      </button>

      {!isProfileStep ? (
        <p className={styles.authFooter}>
          {isLogin ? "حساب کاربری نداری؟" : "حساب کاربری داری؟"}

          <button
            className={styles.footerAction}
            type="button"
            onClick={isLogin ? switchToSignup : switchToLogin}
          >
            {isLogin ? "ثبت نام" : "ورود"}
          </button>
        </p>
      ) : null}
    </form>
  );
}