import { DevOtpSender } from "./DevOtpSender.js";
import { KavenegarOtpSender } from "./KavenegarOtpSender.js";

export function createOtpSender({ env }) {
  if (env.otp.provider === "kavenegar") {
    return new KavenegarOtpSender({
      apiKey: env.kavenegar.apiKey,
      template: env.kavenegar.template
    });
  }

  return new DevOtpSender();
}