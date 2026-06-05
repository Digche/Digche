export const MOBILE_NUMBER_MAX_LENGTH = 11;

const ENGLISH_DIGIT_REGEX = /^[0-9]$/;
const NON_DIGIT_REGEX = /\D/g;
const IRAN_MOBILE_NUMBER_REGEX = /^09[0-9]{9}$/;

const PERSIAN_AND_ARABIC_DIGITS_MAP: Record<string, string> = {
  "۰": "0",
  "۱": "1",
  "۲": "2",
  "۳": "3",
  "۴": "4",
  "۵": "5",
  "۶": "6",
  "۷": "7",
  "۸": "8",
  "۹": "9",

  "٠": "0",
  "١": "1",
  "٢": "2",
  "٣": "3",
  "٤": "4",
  "٥": "5",
  "٦": "6",
  "٧": "7",
  "٨": "8",
  "٩": "9",
};

export function convertDigitsToEnglish(value: string) {
  return value.replace(
    /[۰-۹٠-٩]/g,
    (digit) => PERSIAN_AND_ARABIC_DIGITS_MAP[digit] ?? digit
  );
}

export function sanitizePhoneNumber(value: string) {
  return convertDigitsToEnglish(value)
    .replace(NON_DIGIT_REGEX, "")
    .slice(0, MOBILE_NUMBER_MAX_LENGTH);
}

export function toEnglishDigit(value: string) {
  const convertedValue = convertDigitsToEnglish(value);

  if (!ENGLISH_DIGIT_REGEX.test(convertedValue)) {
    return "";
  }

  return convertedValue;
}

export function isValidIranMobileNumber(value: string) {
  return IRAN_MOBILE_NUMBER_REGEX.test(value);
}