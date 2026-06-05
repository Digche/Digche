"use client";

import { useState } from "react";
import { AuthInput } from "./AuthInput";
import { AuthPasswordInput } from "./AuthPasswordInput";
import { AuthRoleSelect } from "./AuthRoleSelect";
import styles from "./AuthPage.module.css";

export function AuthForm() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  return (
    <form className={styles.form} dir="rtl">
      <div className={styles.fields}>
        <AuthInput
          label="نام کاربری"
          name="fullName"
          type="text"
          autoComplete="name"
        />

        <AuthInput
          label="شماره تلفن"
          name="phoneNumber"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
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