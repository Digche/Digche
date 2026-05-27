export class FakeOtpSender {
  constructor() {
    this.sentMessages = [];
  }

  async send({ phone, code, purpose }) {
    this.sentMessages.push({ phone, code, purpose });
  }
}
