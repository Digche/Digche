import { AuthInput } from "./AuthInput";
import { AuthRoleSelect } from "./AuthRoleSelect";
import styles from "./AuthPage.module.css";

export function AuthForm() {
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

        <AuthInput
          label="رمز عبور"
          name="password"
          type="password"
          autoComplete="new-password"
        />

        <AuthInput
          label="تکرار رمز عبور"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
        />
      </div>

      <button className={styles.submitButton} type="submit">
        ورود
      </button>
    </form>
  );
}