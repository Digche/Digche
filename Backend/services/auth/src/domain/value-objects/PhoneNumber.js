export class PhoneNumber {
  static normalize(phone) {
    if (!phone) {
      throw new PhoneNumberValidationError(
        "Phone number is required",
        "PHONE_NUMBER_REQUIRED"
      );
    }

    let value = String(phone).trim();

    value = PhoneNumber.convertPersianDigitsToEnglish(value);
    value = value.replace(/\s|-/g, "");

    if (value.startsWith("0098")) {
      value = `+98${value.slice(4)}`;
    }

    if (value.startsWith("98")) {
      value = `+${value}`;
    }

    if (value.startsWith("09")) {
      value = `+98${value.slice(1)}`;
    }

    if (!/^\+989\d{9}$/.test(value)) {
      throw new PhoneNumberValidationError(
        "Invalid Iranian mobile number",
        "INVALID_PHONE_NUMBER"
      );
    }

    return value;
  }

  static convertPersianDigitsToEnglish(value) {
    const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
    const arabicDigits = "٠١٢٣٤٥٦٧٨٩";

    return value.replace(/[۰-۹٠-٩]/g, (digit) => {
      const persianIndex = persianDigits.indexOf(digit);
      if (persianIndex !== -1) return String(persianIndex);

      const arabicIndex = arabicDigits.indexOf(digit);
      if (arabicIndex !== -1) return String(arabicIndex);

      return digit;
    });
  }
}

export class PhoneNumberValidationError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "PhoneNumberValidationError";
    this.statusCode = 400;
    this.code = code;
  }
}
