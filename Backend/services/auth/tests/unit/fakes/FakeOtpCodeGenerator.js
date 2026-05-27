export class FakeOtpCodeGenerator {
  constructor(code = "123456") {
    this.code = code;
  }

  generate() {
    return this.code;
  }
}
