export class AuthTokenClient {
  constructor({
    baseUrl,
    internalApiKey,
    timeoutMs = 3000
  }) {
    if (!baseUrl) {
      throw new Error("AUTH_INTERNAL_BASE_URL is required");
    }

    if (!internalApiKey) {
      throw new Error("AUTH_INTERNAL_API_KEY is required");
    }

    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.internalApiKey = internalApiKey;
    this.timeoutMs = timeoutMs;
  }

  async verify(accessToken) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/internal/auth/tokens/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-api-key": this.internalApiKey
        },
        body: JSON.stringify({ accessToken }),
        signal: controller.signal
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(payload.error?.message || "Access token verification failed");
        error.statusCode = response.status;
        error.code = payload.error?.code || "TOKEN_VERIFY_FAILED";
        throw error;
      }

      if (!payload.actor?.id) {
        const error = new Error("Access token verification response is invalid");
        error.statusCode = 502;
        error.code = "INVALID_TOKEN_VERIFY_RESPONSE";
        throw error;
      }

      return payload.actor;
    } finally {
      clearTimeout(timeout);
    }
  }
}
