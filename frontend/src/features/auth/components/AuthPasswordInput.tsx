import type { InputHTMLAttributes } from "react";
import styles from "./AuthPage.module.css";

type AuthPasswordInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  isVisible: boolean;
  onToggleVisibility: () => void;
};

export function AuthPasswordInput({
  label,
  id,
  isVisible,
  onToggleVisibility,
  ...props
}: AuthPasswordInputProps) {
  const inputId = id ?? props.name;

  return (
    <div className={styles.field}>
      <input
        id={inputId}
        className={`${styles.input} ${styles.passwordInput}`}
        placeholder={label}
        aria-label={label}
        {...props}
        type={isVisible ? "text" : "password"}
      />

      <button
        className={`${styles.passwordToggle} ${
          isVisible ? styles.passwordToggleActive : ""
        }`}
        type="button"
        aria-label={isVisible ? `مخفی کردن ${label}` : `نمایش ${label}`}
        aria-pressed={isVisible}
        onClick={onToggleVisibility}
      >
        {isVisible ? (
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.5 12s3.5-6 9.5-6c1.62 0 3.05.44 4.25 1.07M21.5 12s-3.5 6-9.5 6c-1.62 0-3.05-.44-4.25-1.07"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9.88 9.88A3 3 0 0 0 14.12 14.12M4 4l16 16"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </div>
  );
}