import type {
  ChangeEvent,
  ClipboardEvent,
  InputHTMLAttributes,
  KeyboardEvent,
} from "react";
import {
  isAllowedUsernameValue,
  sanitizeUsername,
} from "../utils/username";
import styles from "./AuthPage.module.css";

type AuthUsernameInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function AuthUsernameInput({
  label,
  id,
  onChange,
  onKeyDown,
  onPaste,
  ...props
}: AuthUsernameInputProps) {
  const inputId = id ?? props.name;

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const isShortcutKey = event.ctrlKey || event.metaKey || event.altKey;
    const isControlKey = event.key.length !== 1;

    if (!isShortcutKey && !isControlKey) {
      const isValidCharacter = isAllowedUsernameValue(event.key);

      if (!isValidCharacter) {
        event.preventDefault();
      }
    }

    onKeyDown?.(event);
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const pastedText = event.clipboardData.getData("text");
    const sanitizedText = sanitizeUsername(pastedText);

    if (pastedText !== sanitizedText) {
      event.preventDefault();

      if (sanitizedText.length > 0) {
        const input = event.currentTarget;
        const selectionStart = input.selectionStart ?? input.value.length;
        const selectionEnd = input.selectionEnd ?? input.value.length;

        input.setRangeText(
          sanitizedText,
          selectionStart,
          selectionEnd,
          "end"
        );

        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }

    onPaste?.(event);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const sanitizedValue = sanitizeUsername(input.value);

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
        type="text"
        inputMode="text"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        pattern="[A-Za-z0-9]*"
        title="فقط حروف انگلیسی و اعداد انگلیسی مجاز هستند."
        {...props}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onChange={handleChange}
      />
    </div>
  );
}