import { convertDigitsToEnglish } from "./phone-number";

const NON_DIGIT_REGEX = /\D/g;

export const VERIFICATION_CODE_MAX_LENGTH = 6;

export function sanitizeVerificationCode(value: string) {
  return convertDigitsToEnglish(value)
    .replace(NON_DIGIT_REGEX, "")
    .slice(0, VERIFICATION_CODE_MAX_LENGTH);
}

export function isValidVerificationCode(value: string) {
  return /^\d{4,6}$/.test(value);
}