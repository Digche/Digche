import type { InputHTMLAttributes } from "react";
import styles from "./AuthPage.module.css";

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function AuthInput({ label, id, ...props }: AuthInputProps) {
  const inputId = id ?? props.name;

  return (
    <label className={styles.field} htmlFor={inputId}>
      <input
        id={inputId}
        className={styles.input}
        placeholder={label}
        aria-label={label}
        {...props}
      />
    </label>
  );
}