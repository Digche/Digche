import type { ChangeEvent, InputHTMLAttributes, KeyboardEvent } from "react";
import { isAllowedUsernameValue, sanitizeUsername } from "../utils/username";
import styles from "./AuthPage.module.css";

type AuthUsernameInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> & {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
};

export function AuthUsernameInput({
  label,
  id,
  value,
  onValueChange,
  onKeyDown,
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

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onValueChange(sanitizeUsername(event.currentTarget.value));
  }

  return (
    <label className={styles.field} htmlFor={inputId}>
      <span className={styles.fieldLabel}>{label}</span>

      <input
        id={inputId}
        className={styles.input}
        type="text"
        inputMode="text"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        pattern="[A-Za-z0-9_]{3,50}"
        title="فقط حروف انگلیسی، اعداد انگلیسی و آندرلاین مجاز هستند."
        aria-label={label}
        value={value}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        {...props}
      />
    </label>
  );
}