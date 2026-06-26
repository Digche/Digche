"use client";

import { useState, type FormEventHandler } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthCodeInput } from "./AuthCodeInput";
import { AuthInput } from "./AuthInput";
import { AuthPhoneNumberInput } from "./AuthPhoneNumberInput";
import { AuthRoleSelect } from "./AuthRoleSelect";
import { AuthUsernameInput } from "./AuthUsernameInput";
import { useAuthFormStore } from "../store/auth.store";
import {
  completePublicRegistration,
  getAuthErrorMessage,
  getFrontendRoleLabel,
  isPublicAuthSuccessResponse,
  isRegistrationRequiredResponse,
  requestPublicOtp,
  toBackendAuthRole,
  toFrontendAuthRole,
  verifyPublicOtp,
  type FrontendAuthRole,
  type PublicAuthFlow,
  type PublicAuthSuccessResponse,
  type RegistrationRequiredResponse,
} from "../services/auth-api";
import { useAuthStore as useSessionStore } from "@/store/auth-store";
import { isValidIranMobileNumber } from "../utils/phone-number";
import { isValidUsername } from "../utils/username";
import { isValidVerificationCode } from "../utils/verification-code";
import styles from "./AuthPage.module.css";

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [addRoleRegistration, setAddRoleRegistration] =
    useState<RegistrationRequiredResponse | null>(null);

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

  const backendRole = toBackendAuthRole(role);
  const authFlow: PublicAuthFlow = isLogin ? "login" : "register";

  const title = getFormTitle();
  const subtitle = getFormSubtitle();
  const submitText = isSubmitting ? "در حال ارسال..." : getSubmitText();
  const isAddRoleModalOpen = Boolean(addRoleRegistration);

  function getFormTitle() {
    if (isVerificationStep) {
      return "کد تایید";
    }

    if (isProfileStep) {
      return "تکمیل ثبت‌نام";
    }

    return isLogin ? "ورود" : "ثبت‌نام";
  }

  function getFormSubtitle() {
    if (isVerificationStep) {
      return "لطفاً کد پیامک‌شده را وارد کنید.";
    }

    if (isProfileStep) {
      return "اطلاعات کاربری خود را تکمیل کنید.";
    }

    return "لطفاً شماره تماس خود را وارد کنید.";
  }

  function getSubmitText() {
    if (isProfileStep) {
      return "تکمیل ثبت‌نام";
    }

    if (isVerificationStep || !isLogin) {
      return "تایید";
    }

    return "ورود";
  }

  function getPostAuthRedirectPath(frontendRole: FrontendAuthRole) {
    const nextPath = searchParams.get("next");

    if (
      nextPath &&
      nextPath.startsWith("/") &&
      !nextPath.startsWith("//")
    ) {
      if (frontendRole === "chef" && nextPath.startsWith("/chef")) {
        return nextPath;
      }

      if (frontendRole === "customer" && !nextPath.startsWith("/chef")) {
        return nextPath;
      }
    }

    return frontendRole === "chef" ? "/chef" : "/";
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
      setRegistrationToken(null);
      setAddRoleRegistration(null);

      await requestPublicOtp({
        phone: form.phoneNumber,
        role: backendRole,
        flow: authFlow,
      });

      setStep("verification");
    } catch (error) {
      setErrorMessage(
        getAuthErrorMessage(error, {
          action: "requestOtp",
          flow: authFlow,
          role,
        })
      );
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
        role: backendRole,
        flow: authFlow,
      });

      if (isRegistrationRequiredResponse(authResult)) {
        if (isLogin) {
          setRegistrationToken(null);

          setErrorMessage(
            `حساب ${getFrontendRoleLabel(
              backendRole
            )} برای این شماره وجود ندارد یا ثبت‌نام آن کامل نشده است. لطفاً از بخش ثبت‌نام استفاده کنید.`
          );

          return;
        }

        setRegistrationToken(authResult.registrationToken);

        if (authResult.registrationMode === "add_role") {
          setAddRoleRegistration(authResult);
          return;
        }

        setStep("profile");
        return;
      }

      if (!isPublicAuthSuccessResponse(authResult)) {
        setErrorMessage(
          "پاسخ سرویس احراز هویت کامل نیست. accessToken یا refreshToken دریافت نشد."
        );
        return;
      }

      completeAuthentication(authResult);
    } catch (error) {
      setErrorMessage(
        getAuthErrorMessage(error, {
          action: "verifyOtp",
          flow: authFlow,
          role,
        })
      );
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

      if (!authResult.refreshToken) {
        setErrorMessage("ثبت‌نام انجام شد، اما refreshToken از بک‌اند دریافت نشد.");
        return;
      }

      completeAuthentication(authResult);
    } catch (error) {
      setErrorMessage(
        getAuthErrorMessage(error, {
          action: "completeRegistration",
          flow: "register",
          role,
        })
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function submitAddRoleStep() {
    if (!addRoleRegistration?.registrationToken) {
      setErrorMessage("توکن ثبت‌نام پیدا نشد. لطفاً دوباره کد تایید بگیرید.");
      setAddRoleRegistration(null);
      setRegistrationToken(null);
      setStep("phone");
      return;
    }

    try {
      setSubmitting(true);
      clearErrorMessage();

      const authResult = await completePublicRegistration({
        registrationToken: addRoleRegistration.registrationToken,
      });

      completeAuthentication(authResult);
    } catch (error) {
      setErrorMessage(
        getAuthErrorMessage(error, {
          action: "completeRegistration",
          flow: "register",
          role,
        })
      );
    } finally {
      setSubmitting(false);
    }
  }

  function completeAuthentication(authResult: PublicAuthSuccessResponse) {
    const frontendRole = toFrontendAuthRole(authResult.user.selectedRole);

    if (!authResult.accessToken || !authResult.refreshToken) {
      setErrorMessage("نشست کاربری کامل نیست. لطفاً دوباره وارد شوید.");
      return;
    }

    if (!authResult.user.roles.includes(authResult.user.selectedRole)) {
      setErrorMessage("نقش انتخاب‌شده در حساب کاربری شما فعال نیست.");
      return;
    }

    if (authResult.user.selectedRole === "chef" && !authResult.user.chef) {
      setErrorMessage("اطلاعات حساب آشپز از بک‌اند دریافت نشد.");
      return;
    }

    if (
      authResult.user.selectedRole === "chef" &&
      authResult.user.chef?.status &&
      authResult.user.chef.status !== "active"
    ) {
      setErrorMessage("حساب آشپز شما فعال نیست و اجازه ورود ندارید.");
      return;
    }

    setSession(authResult);
    setAddRoleRegistration(null);
    resetForm();

    router.replace(getPostAuthRedirectPath(frontendRole));
  }

  function handleRoleChange(nextRole: FrontendAuthRole) {
    setRole(nextRole);
    setStep("phone");
    setRegistrationToken(null);
    setAddRoleRegistration(null);
    clearErrorMessage();
  }

  function switchToLogin() {
    setMode("login");
    setStep("phone");
    setRegistrationToken(null);
    setAddRoleRegistration(null);
    clearErrorMessage();
  }

  function switchToSignup() {
    setMode("signup");
    setStep("phone");
    setRegistrationToken(null);
    setAddRoleRegistration(null);
    clearErrorMessage();
  }

  return (
    <form className={styles.form} dir="rtl" onSubmit={handleSubmit}>
      <div className={isAddRoleModalOpen ? styles.formDimmed : undefined}>
      <AuthRoleSelect value={role} onChange={handleRoleChange} />

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
            {isLogin ? "ثبت‌نام" : "ورود"}
          </button>
        </p>
      ) : null}
      </div>

      {addRoleRegistration ? (
        <div className={styles.addRoleOverlay} role="dialog" aria-modal="true">
          <div className={styles.addRoleBox}>
            <h3 className={styles.addRoleTitle}>
              نقش {getFrontendRoleLabel(addRoleRegistration.role)} به حساب شما اضافه می‌شود
            </h3>

            <p className={styles.addRoleText}>
              شما قبلاً با همین شماره ثبت‌نام کرده‌اید. نقش جدید با همان
              مشخصات حساب قبلی به پروفایل شما اضافه خواهد شد.
            </p>

            {addRoleRegistration.existingUser?.username ? (
              <p className={styles.addRoleMeta}>
                نام کاربری فعلی: {addRoleRegistration.existingUser.username}
              </p>
            ) : null}

            {errorMessage ? (
              <p className={styles.addRoleError} role="alert">
                {errorMessage}
              </p>
            ) : null}

            <button
              className={styles.addRoleButton}
              type="button"
              disabled={isSubmitting}
              onClick={submitAddRoleStep}
            >
              {isSubmitting
                ? "در حال ورود..."
                : addRoleRegistration.role === "chef"
                  ? "ورود به پنل آشپز"
                  : "ورود به برنامه"}
            </button>
          </div>
        </div>
      ) : null}
    </form>
  );
}
