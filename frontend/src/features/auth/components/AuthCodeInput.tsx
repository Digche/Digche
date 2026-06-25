import type { ChangeEvent, InputHTMLAttributes, KeyboardEvent } from "react";
import { toEnglishDigit } from "../utils/phone-number";
import {
  sanitizeVerificationCode,
  VERIFICATION_CODE_MAX_LENGTH,
} from "../utils/verification-code";
import styles from "./AuthPage.module.css";

type AuthCodeInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> & {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
};

export function AuthCodeInput({
  label,
  id,
  value,
  onValueChange,
  onKeyDown,
  ...props
}: AuthCodeInputProps) {
  const inputId = id ?? props.name;

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const isShortcutKey = event.ctrlKey || event.metaKey || event.altKey;
    const isControlKey = event.key.length !== 1;

    if (!isShortcutKey && !isControlKey && !toEnglishDigit(event.key)) {
      event.preventDefault();
    }

    onKeyDown?.(event);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onValueChange(sanitizeVerificationCode(event.currentTarget.value));
  }

  return (
    <label className={styles.field} htmlFor={inputId}>
      <span className={styles.fieldLabel}>{label}</span>

      <input
        id={inputId}
        className={styles.input}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        autoCorrect="off"
        spellCheck={false}
        maxLength={VERIFICATION_CODE_MAX_LENGTH}
        aria-label={label}
        value={value}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        {...props}
      />
    </label>
  );
}