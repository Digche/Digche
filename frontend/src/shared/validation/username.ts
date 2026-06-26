const USERNAME_ALLOWED_VALUE_REGEX = /^[A-Za-z0-9_]*$/;
const USERNAME_DISALLOWED_CHARACTER_REGEX = /[^A-Za-z0-9_]/g;
const USERNAME_REGEX = /^[A-Za-z0-9_]{3,50}$/;

export function isAllowedUsernameValue(value: string) {
  return USERNAME_ALLOWED_VALUE_REGEX.test(value);
}

export function sanitizeUsername(value: string) {
  return value.replace(USERNAME_DISALLOWED_CHARACTER_REGEX, "").slice(0, 50);
}

export function isValidUsername(value: string) {
  return USERNAME_REGEX.test(value.trim());
}