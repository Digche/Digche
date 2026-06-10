import type { InputHTMLAttributes } from "react";
import styles from "./AuthPage.module.css";

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function AuthInput({ label, id, ...props }: AuthInputProps) {
  const inputId = id ?? props.name;

  return (
    <label className={styles.field} htmlFor={inputId}>
      <span className={styles.fieldLabel}>{label}</span>

      <input
        id={inputId}
        className={styles.input}
        aria-label={label}
        {...props}
      />
    </label>
  );
}