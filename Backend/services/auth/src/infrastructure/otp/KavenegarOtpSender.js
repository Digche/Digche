import Kavenegar from "kavenegar";
import { AppError } from "../../application/errors/AppError.js";

export class KavenegarOtpSender {
  constructor({ apiKey, template }) {
    if (!apiKey) {
      throw new Error("Kavenegar API key is required");
    }

    if (!template) {
      throw new Error("Kavenegar template is required");
    }

    this.template = template;
    this.api = Kavenegar.KavenegarApi({
      apikey: apiKey
    });
  }

  async send({ phone, code }) {
    const receptor = this.formatPhoneForKavenegar(phone);

    return new Promise((resolve, reject) => {
      this.api.VerifyLookup(
        {
          receptor,
          token: code,
          template: this.template
        },
        (response, status) => {
          if (status !== 200) {
            return reject(
              new AppError(
                "OTP delivery failed",
                502,
                "OTP_DELIVERY_FAILED"
              )
            );
          }

          resolve(response);
        }
      );
    });
  }

  formatPhoneForKavenegar(phone) {
    if (phone.startsWith("+98")) {
      return `0${phone.slice(3)}`;
    }

    return phone;
  }
}