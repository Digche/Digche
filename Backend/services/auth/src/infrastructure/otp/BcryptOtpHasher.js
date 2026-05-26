import bcrypt from "bcryptjs";
import { OtpHasher } from "../../application/services/OtpHasher.js";

export class BcryptOtpHasher extends OtpHasher {
  async hash(code) {
    return bcrypt.hash(code, 10);
  }

  async compare(code, hash) {
    return bcrypt.compare(code, hash);
  }
}