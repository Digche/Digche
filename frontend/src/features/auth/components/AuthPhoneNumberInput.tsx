import type { ChangeEvent, InputHTMLAttributes, KeyboardEvent } from "react";
import {
  MOBILE_NUMBER_MAX_LENGTH,
  sanitizePhoneNumber,
  toEnglishDigit,
} from "../utils/phone-number";
import styles from "./AuthPage.module.css";

type AuthPhoneNumberInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> & {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
};

export function AuthPhoneNumberInput({
  label,
  id,
  value,
  onValueChange,
  onKeyDown,
  autoComplete = "tel",
  ...props
}: AuthPhoneNumberInputProps) {
  const inputId = id ?? props.name;

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const isShortcutKey = event.ctrlKey || event.metaKey || event.altKey;
    const isControlKey = event.key.length !== 1;

    if (!isShortcutKey && !isControlKey) {
      const englishDigit = toEnglishDigit(event.key);

      if (!englishDigit) {
        event.preventDefault();
      }
    }

    onKeyDown?.(event);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onValueChange(sanitizePhoneNumber(event.currentTarget.value));
  }

  return (
    <label className={styles.field} htmlFor={inputId}>
      <span className={styles.fieldLabel}>{label}</span>

      <input
        id={inputId}
        className={styles.input}
        type="tel"
        inputMode="numeric"
        autoComplete={autoComplete}
        autoCorrect="off"
        spellCheck={false}
        maxLength={MOBILE_NUMBER_MAX_LENGTH}
        minLength={MOBILE_NUMBER_MAX_LENGTH}
        pattern="09[0-9]{9}"
        title="شماره موبایل باید با 09 شروع شود و دقیقاً 11 رقم باشد."
        aria-label={label}
        value={value}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        {...props}
      />
    </label>
  );
}