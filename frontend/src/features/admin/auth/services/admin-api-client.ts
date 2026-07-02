import { API_BASE_URL } from "@/config/api";
import { AdminAuthApiError } from "./admin-auth-api";
import { useAdminAuthStore } from "../store/admin-auth-store";

type AdminApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
  retryOnUnauthorized?: boolean;
};

export async function adminApiRequest<ResponseBody>(
  path: string,
  options: AdminApiRequestOptions = {}
): Promise<ResponseBody> {
  return sendAdminApiRequest<ResponseBody>(path, options, false);
}

async function sendAdminApiRequest<ResponseBody>(
  path: string,
  options: AdminApiRequestOptions,
  hasRetried: boolean
): Promise<ResponseBody> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  const body = buildRequestBody(options.body, headers);

  if (options.auth !== false) {
    const accessToken =
      await useAdminAuthStore.getState().ensureFreshAccessToken();

    if (!accessToken) {
      expireAdminSession();
      throw new AdminAuthApiError(
        "نشست ادمین منقضی شده است. لطفاً دوباره وارد شوید.",
        401,
        "ADMIN_SESSION_EXPIRED"
      );
    }

    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      cache: options.cache ?? "no-store",
      headers,
      body,
    });
  } catch {
    throw new AdminAuthApiError(
      "ارتباط با سرویس برقرار نشد. وضعیت بک‌اند یا اینترنت را بررسی کنید.",
      0,
      "NETWORK_ERROR"
    );
  }

  if (
    response.status === 401 &&
    options.auth !== false &&
    options.retryOnUnauthorized !== false &&
    !hasRetried
  ) {
    const refreshedSession = await useAdminAuthStore.getState().refreshSession();

    if (refreshedSession?.accessToken) {
      return sendAdminApiRequest<ResponseBody>(path, options, true);
    }

    expireAdminSession();
  }

  const responseBody = await readJsonResponse(response);

  if (!response.ok) {
    const errorBody = responseBody as
      | {
          error?: { code?: string; message?: string };
          code?: string;
          message?: string;
        }
      | null;

    const code = errorBody?.error?.code || errorBody?.code;
    const message = errorBody?.error?.message || errorBody?.message;

    throw new AdminAuthApiError(
      message || getFallbackErrorMessage(response.status),
      response.status,
      code,
      message
    );
  }

  return responseBody as ResponseBody;
}

function buildRequestBody(body: unknown, headers: Headers): BodyInit | undefined {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (typeof FormData !== "undefined" && body instanceof FormData) {
    return body;
  }

  if (typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams) {
    return body;
  }

  if (typeof Blob !== "undefined" && body instanceof Blob) {
    return body;
  }

  if (typeof body === "string") {
    return body;
  }

  headers.set("Content-Type", "application/json");
  return JSON.stringify(body);
}

async function readJsonResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function expireAdminSession() {
  useAdminAuthStore.getState().clearSession();

  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event("digche:admin-auth-expired"));

  const pathname = window.location.pathname;

  if (pathname.startsWith("/admin/") || pathname === "/admin") {
    const nextPath = `${pathname}${window.location.search}`;
    window.location.replace(`/admin-login?next=${encodeURIComponent(nextPath)}`);
  }
}

function getFallbackErrorMessage(status: number) {
  if (status === 401) return "نشست ادمین معتبر نیست یا منقضی شده است.";
  if (status === 403) return "شما اجازه انجام این عملیات را ندارید.";
  if (status === 404) return "منبع مورد نظر پیدا نشد.";
  if (status === 429) return "تعداد درخواست‌ها زیاد شده است. کمی بعد تلاش کنید.";
  if (status >= 500) return "خطای داخلی سرور رخ داده است.";
  return "درخواست ناموفق بود.";
}
