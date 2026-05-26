export class OtpHasher {
  async hash(code) {
    throw new Error("OtpHasher.hash is not implemented");
  }

  async compare(code, hash) {
    throw new Error("OtpHasher.compare is not implemented");
  }
}