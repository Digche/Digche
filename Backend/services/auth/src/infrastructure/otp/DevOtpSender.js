import { OtpSender } from "../../application/services/OtpSender.js";
import { logger } from "../logging/logger.js";

export class DevOtpSender extends OtpSender {
  async send({ phone, code, purpose }) {
    if (process.env.NODE_ENV === "production") {
      logger.warn(
        {
          phone,
          purpose
        },
        "DevOtpSender was called in production. OTP code was not logged."
      );

      return true;
    }

    logger.info(
      {
        phone,
        code,
        purpose
      },
      "DEV OTP code generated"
    );

    return true;
  }
}