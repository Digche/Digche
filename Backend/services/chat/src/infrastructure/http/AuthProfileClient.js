export class AuthProfileClient {
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

  async resolveProfiles(participants) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/internal/auth/profiles/resolve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-api-key": this.internalApiKey
        },
        body: JSON.stringify({ participants }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`Auth profile resolve failed with status ${response.status}`);
      }

      const payload = await response.json();

      return Array.isArray(payload.profiles) ? payload.profiles : [];
    } finally {
      clearTimeout(timeout);
    }
  }
}
