import type {
  ChangeEvent,
  ClipboardEvent,
  InputHTMLAttributes,
  KeyboardEvent,
} from "react";
import {
  MOBILE_NUMBER_MAX_LENGTH,
  sanitizePhoneNumber,
  toEnglishDigit,
} from "../utils/phone-number";
import styles from "./AuthPage.module.css";

type AuthPhoneNumberInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function AuthPhoneNumberInput({
  label,
  id,
  onChange,
  onKeyDown,
  onPaste,
  autoComplete = "tel",
  ...props
}: AuthPhoneNumberInputProps) {
  const inputId = id ?? props.name;

  function insertDigits(input: HTMLInputElement, digits: string) {
    const selectionStart = input.selectionStart ?? input.value.length;
    const selectionEnd = input.selectionEnd ?? input.value.length;
    const selectedLength = selectionEnd - selectionStart;
    const currentLengthAfterReplace = input.value.length - selectedLength;
    const remainingLength = MOBILE_NUMBER_MAX_LENGTH - currentLengthAfterReplace;

    if (remainingLength <= 0) {
      return;
    }

    const sanitizedDigits = sanitizePhoneNumber(digits).slice(0, remainingLength);

    if (sanitizedDigits.length === 0) {
      return;
    }

    input.setRangeText(sanitizedDigits, selectionStart, selectionEnd, "end");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const isShortcutKey = event.ctrlKey || event.metaKey || event.altKey;
    const isControlKey = event.key.length !== 1;

    if (!isShortcutKey && !isControlKey) {
      const englishDigit = toEnglishDigit(event.key);

      if (!englishDigit) {
        event.preventDefault();
      } else {
        const input = event.currentTarget;
        const selectionStart = input.selectionStart ?? input.value.length;
        const selectionEnd = input.selectionEnd ?? input.value.length;
        const selectedLength = selectionEnd - selectionStart;
        const currentLengthAfterReplace = input.value.length - selectedLength;
        const hasReachedMaxLength =
          currentLengthAfterReplace >= MOBILE_NUMBER_MAX_LENGTH;

        if (hasReachedMaxLength) {
          event.preventDefault();
        } else if (englishDigit !== event.key) {
          event.preventDefault();
          insertDigits(input, englishDigit);
        }
      }
    }

    onKeyDown?.(event);
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();

    const pastedText = event.clipboardData.getData("text");
    const sanitizedText = sanitizePhoneNumber(pastedText);

    insertDigits(event.currentTarget, sanitizedText);

    onPaste?.(event);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const sanitizedValue = sanitizePhoneNumber(input.value);

    if (input.value !== sanitizedValue) {
      input.value = sanitizedValue;
    }

    onChange?.(event);
  }

  return (
    <div className={styles.field}>
      <input
        id={inputId}
        className={styles.input}
        placeholder={label}
        aria-label={label}
        type="tel"
        inputMode="numeric"
        autoComplete={autoComplete}
        autoCorrect="off"
        spellCheck={false}
        maxLength={MOBILE_NUMBER_MAX_LENGTH}
        minLength={MOBILE_NUMBER_MAX_LENGTH}
        pattern="09[0-9]{9}"
        title="شماره موبایل باید با 09 شروع شود و دقیقاً 11 رقم انگلیسی باشد."
        {...props}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onChange={handleChange}
      />
    </div>
  );
}