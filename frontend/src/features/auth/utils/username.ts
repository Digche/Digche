const USERNAME_ALLOWED_VALUE_REGEX = /^[A-Za-z0-9]*$/;
const USERNAME_DISALLOWED_CHARACTER_REGEX = /[^A-Za-z0-9]/g;

export function isAllowedUsernameValue(value: string) {
  return USERNAME_ALLOWED_VALUE_REGEX.test(value);
}

export function sanitizeUsername(value: string) {
  return value.replace(USERNAME_DISALLOWED_CHARACTER_REGEX, "");
}