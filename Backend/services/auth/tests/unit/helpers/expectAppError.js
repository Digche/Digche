import { expect } from "vitest";

export async function expectAppError(promise, { statusCode, code, message } = {}) {
  try {
    await promise;
    throw new Error("Expected promise to reject");
  } catch (error) {
    if (statusCode !== undefined) {
      expect(error.statusCode).toBe(statusCode);
    }

    if (code !== undefined) {
      expect(error.code).toBe(code);
    }

    if (message !== undefined) {
      expect(error.message).toBe(message);
    }

    return error;
  }
}
