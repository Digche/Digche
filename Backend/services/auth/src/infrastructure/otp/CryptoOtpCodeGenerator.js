import crypto from "crypto";
import { OtpCodeGenerator } from "../../application/services/OtpCodeGenerator.js";

export class CryptoOtpCodeGenerator extends OtpCodeGenerator {
  generate() {
    return String(crypto.randomInt(100000, 1000000));
  }
}