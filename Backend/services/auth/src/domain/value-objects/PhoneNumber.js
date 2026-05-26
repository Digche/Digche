export class PhoneNumber {
  static normalize(phone) {
    if (!phone) {
      throw new Error("Phone number is required");
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
      throw new Error("Invalid Iranian mobile number");
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