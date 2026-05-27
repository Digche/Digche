export class FakeOtpHasher {
  async hash(code) {
    return `hashed:${code}`;
  }

  async compare(code, hash) {
    return hash === `hashed:${code}`;
  }
}
