import { convertDigitsToEnglish, toEnglishDigit } from "@/shared/validation/phone-number";

const PERSIAN_AND_ARABIC_DIGIT_REGEX = /[۰-۹٠-٩]/g;
const ENGLISH_DIGIT_REGEX = /[0-9]/g;

export function sanitizePersonalName(value: string) {
  return convertDigitsToEnglish(value)
    .replace(ENGLISH_DIGIT_REGEX, "")
    .replace(PERSIAN_AND_ARABIC_DIGIT_REGEX, "");
}

export function isDigitKey(value: string) {
  return Boolean(toEnglishDigit(value));
}