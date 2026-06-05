"use client";

import { useState } from "react";
import { AuthPasswordInput } from "./AuthPasswordInput";
import { AuthPhoneNumberInput } from "./AuthPhoneNumberInput";
import { AuthRoleSelect } from "./AuthRoleSelect";
import { AuthUsernameInput } from "./AuthUsernameInput";
import styles from "./AuthPage.module.css";

export function AuthForm() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  return (
    <form className={styles.form} dir="rtl">
      <div className={styles.fields}>
        <AuthUsernameInput
          label="نام کاربری"
          name="username"
          autoComplete="username"
        />

        <AuthPhoneNumberInput
          label="شماره تلفن"
          name="phoneNumber"
          autoComplete="tel"
          required
        />

        <AuthRoleSelect />

        <AuthPasswordInput
          label="رمز عبور"
          name="password"
          autoComplete="new-password"
          isVisible={isPasswordVisible}
          onToggleVisibility={() => setIsPasswordVisible((prev) => !prev)}
        />

        <AuthPasswordInput
          label="تکرار رمز عبور"
          name="confirmPassword"
          autoComplete="new-password"
          isVisible={isConfirmPasswordVisible}
          onToggleVisibility={() =>
            setIsConfirmPasswordVisible((prev) => !prev)
          }
        />
      </div>

      <button className={styles.submitButton} type="submit">
        ورود
      </button>
    </form>
  );
}