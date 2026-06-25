"use client";

import type { FormEventHandler } from "react";
import { useRouter } from "next/navigation";
import { AuthCodeInput } from "./AuthCodeInput";
import { AuthInput } from "./AuthInput";
import { AuthPhoneNumberInput } from "./AuthPhoneNumberInput";
import { AuthRoleSelect } from "./AuthRoleSelect";
import { AuthUsernameInput } from "./AuthUsernameInput";
import { useAuthFormStore } from "../store/auth.store";
import {
  completePublicRegistration,
  getAuthErrorMessage,
  requestPublicOtp,
  toBackendAuthRole,
  toFrontendAuthRole,
  verifyPublicOtp,
  type PublicAuthSuccessResponse,
} from "../services/auth-api";
import { useAuthStore as useSessionStore } from "@/store/auth-store";
import { isValidIranMobileNumber } from "../utils/phone-number";
import { isValidUsername } from "../utils/username";
import { isValidVerificationCode } from "../utils/verification-code";
import styles from "./AuthPage.module.css";

export function AuthForm() {
  const router = useRouter();

  const mode = useAuthFormStore((state) => state.mode);
  const step = useAuthFormStore((state) => state.step);
  const role = useAuthFormStore((state) => state.role);
  const form = useAuthFormStore((state) => state.form);
  const registrationToken = useAuthFormStore((state) => state.registrationToken);
  const isSubmitting = useAuthFormStore((state) => state.isSubmitting);
  const errorMessage = useAuthFormStore((state) => state.errorMessage);
  const setMode = useAuthFormStore((state) => state.setMode);
  const setStep = useAuthFormStore((state) => state.setStep);
  const setRole = useAuthFormStore((state) => state.setRole);
  const setRegistrationToken = useAuthFormStore(
    (state) => state.setRegistrationToken
  );
  const setSubmitting = useAuthFormStore((state) => state.setSubmitting);
  const setErrorMessage = useAuthFormStore((state) => state.setErrorMessage);
  const clearErrorMessage = useAuthFormStore((state) => state.clearErrorMessage);
  const setField = useAuthFormStore((state) => state.setField);
  const resetForm = useAuthFormStore((state) => state.resetForm);

  const setSession = useSessionStore((state) => state.setSession);

  const isLogin = mode === "login";
  const isPhoneStep = step === "phone";
  const isVerificationStep = step === "verification";
  const isProfileStep = step === "profile";

  const title = getFormTitle();
  const subtitle = getFormSubtitle();
  const submitText = isSubmitting ? "در حال ارسال..." : getSubmitText();

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

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
  event.preventDefault();

  if (isSubmitting) {
    return;
  }

  if (isPhoneStep) {
    await submitPhoneStep();
    return;
  }

  if (isVerificationStep) {
    await submitVerificationStep();
    return;
  }

  if (isProfileStep) {
    await submitProfileStep();
  }
};

  async function submitPhoneStep() {
    if (!isValidIranMobileNumber(form.phoneNumber)) {
      setErrorMessage("شماره تماس معتبر نیست.");
      return;
    }

    try {
      setSubmitting(true);
      clearErrorMessage();

      await requestPublicOtp({
        phone: form.phoneNumber,
        role: toBackendAuthRole(role),
        flow: isLogin ? "login" : "register",
      });

      setStep("verification");
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function submitVerificationStep() {
    if (!isValidVerificationCode(form.verificationCode)) {
      setErrorMessage("کد تایید باید بین ۴ تا ۶ رقم باشد.");
      return;
    }

    try {
      setSubmitting(true);
      clearErrorMessage();

      const authResult = await verifyPublicOtp({
        phone: form.phoneNumber,
        code: form.verificationCode,
        role: toBackendAuthRole(role),
        flow: isLogin ? "login" : "register",
      });

      if (authResult.requiresRegistration) {
        setRegistrationToken(authResult.registrationToken);
        setStep("profile");
        return;
      }

      completeAuthentication(authResult);
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function submitProfileStep() {
    if (!registrationToken) {
      setErrorMessage("توکن ثبت‌نام پیدا نشد. لطفاً دوباره کد تایید بگیرید.");
      setStep("phone");
      return;
    }

    if (!form.firstName.trim()) {
      setErrorMessage("نام را وارد کنید.");
      return;
    }

    if (!form.lastName.trim()) {
      setErrorMessage("نام خانوادگی را وارد کنید.");
      return;
    }

    if (!isValidUsername(form.username)) {
      setErrorMessage(
        "نام کاربری باید ۳ تا ۵۰ کاراکتر و فقط شامل حروف انگلیسی، عدد و آندرلاین باشد."
      );
      return;
    }

    try {
      setSubmitting(true);
      clearErrorMessage();

      const authResult = await completePublicRegistration({
        registrationToken,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        username: form.username.trim(),
      });

      completeAuthentication(authResult);
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  function completeAuthentication(authResult: PublicAuthSuccessResponse) {
  setSession(authResult);
  resetForm();

  router.push("/");
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
              disabled={isSubmitting}
              value={form.firstName}
              onChange={(event) => setField("firstName", event.target.value)}
            />

            <AuthInput
              label="نام خانوادگی"
              name="lastName"
              placeholder="رحمانی"
              required
              disabled={isSubmitting}
              value={form.lastName}
              onChange={(event) => setField("lastName", event.target.value)}
            />

            <AuthUsernameInput
              label="نام کاربری"
              name="username"
              placeholder="Moti_Rahmani"
              required
              disabled={isSubmitting}
              value={form.username}
              onValueChange={(value) => setField("username", value)}
            />
          </>
        ) : null}
      </div>

      {errorMessage ? (
        <p
          role="alert"
          style={{
            margin: "18px 0 0",
            color: "#b42318",
            background: "#fff1f0",
            border: "1px solid rgba(180, 35, 24, 0.18)",
            borderRadius: 16,
            padding: "10px 14px",
            fontSize: 14,
            fontWeight: 700,
            lineHeight: 1.8,
            textAlign: "center",
          }}
        >
          {errorMessage}
        </p>
      ) : null}

      <button
        className={styles.submitButton}
        type="submit"
        disabled={isSubmitting}
      >
        {submitText}
      </button>

      {!isProfileStep ? (
        <p className={styles.authFooter}>
          {isLogin ? "حساب کاربری نداری؟" : "حساب کاربری داری؟"}

          <button
            className={styles.footerAction}
            type="button"
            disabled={isSubmitting}
            onClick={isLogin ? switchToSignup : switchToLogin}
          >
            {isLogin ? "ثبت نام" : "ورود"}
          </button>
        </p>
      ) : null}
    </form>
  );
}