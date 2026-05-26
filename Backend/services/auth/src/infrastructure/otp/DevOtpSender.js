import { OtpSender } from "../../application/services/OtpSender.js";

export class DevOtpSender extends OtpSender {
  async send({ phone, code, purpose }) {
    console.log("[DEV OTP]", {
      phone,
      code,
      purpose
    });

    return true;
  }
}