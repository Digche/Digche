import { API_BASE_URL } from "@/config/api";
import type {
  AdminMeResponse,
  AdminOtpSentResponse,
  AdminSessionResponse,
} from "../types/admin-auth.types";

type ErrorResponseBody = {
  error?: {
    code?: string;
    message?: string;
  };
  code?: string;
  message?: string;
};

type RequestJsonOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  accessToken?: string | null;
  headers?: HeadersInit;
};

export class AdminAuthApiError extends Error {
  status: number;
  code?: string;
  backendMessage?: string;

  constructor(
    message: string,
    status: number,
    code?: string,
    backendMessage?: string
  ) {
    super(message);
    this.name = "AdminAuthApiError";
    this.status = status;
    this.code = code;
    this.backendMessage = backendMessage;
  }
}

async function requestJson<ResponseBody>(
  path: string,
  options: RequestJsonOptions = {}
): Promise<ResponseBody> {
  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (options.accessToken) {
    headers.set("Authorization", `Bearer ${options.accessToken}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? "GET",
      cache: "no-store",
      headers,
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new AdminAuthApiError(
      "ارتباط با سرویس احراز هویت ادمین برقرار نشد. وضعیت بک‌اند یا آدرس API را بررسی کنید.",
      0,
      "NETWORK_ERROR"
    );
  }

  const responseBody = await readJsonResponse(response);

  if (!response.ok) {
    const errorBody = responseBody as ErrorResponseBody | null;
    const code = errorBody?.error?.code || errorBody?.code;
    const message = errorBody?.error?.message || errorBody?.message;

    throw new AdminAuthApiError(
      message || getFallbackHttpErrorMessage(response.status),
      response.status,
      code,
      message
    );
  }

  return responseBody as ResponseBody;
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

function getFallbackHttpErrorMessage(status: number) {
  if (status === 400) {
    return "اطلاعات واردشده معتبر نیست.";
  }

  if (status === 401) {
    return "کد تایید اشتباه است یا نشست ادمین منقضی شده است.";
  }

  if (status === 403) {
    return "این شماره اجازه ورود به پنل ادمین را ندارد.";
  }

  if (status === 404) {
    return "حساب ادمین پیدا نشد.";
  }

  if (status === 429) {
    return "تعداد درخواست‌ها زیاد شده است. کمی بعد دوباره تلاش کنید.";
  }

  if (status === 502 || status === 503 || status === 504) {
    return "Gateway یا سرویس احراز هویت در دسترس نیست.";
  }

  if (status >= 500) {
    return "خطای داخلی سرویس احراز هویت ادمین.";
  }

  return "ورود ادمین ناموفق بود.";
}

export function requestAdminOtp(input: { phone: string }) {
  return requestJson<AdminOtpSentResponse>("/admin/auth/request-otp", {
    method: "POST",
    body: {
      phone: input.phone,
    },
  });
}

export function verifyAdminOtp(input: { phone: string; code: string }) {
  return requestJson<AdminSessionResponse>("/admin/auth/verify-otp", {
    method: "POST",
    body: {
      phone: input.phone,
      code: input.code,
    },
  });
}

export function refreshAdminSession(refreshToken: string) {
  return requestJson<AdminSessionResponse>("/admin/auth/refresh", {
    method: "POST",
    body: {
      refreshToken,
    },
  });
}

export function logoutAdminSession(refreshToken: string) {
  return requestJson<{ message: string; success: boolean }>(
    "/admin/auth/logout",
    {
      method: "POST",
      body: {
        refreshToken,
      },
    }
  );
}

export function getCurrentAdmin(accessToken: string) {
  return requestJson<AdminMeResponse>("/admin/auth/me", {
    method: "GET",
    accessToken,
  });
}

export function getAdminAuthErrorMessage(error: unknown) {
  if (!(error instanceof AdminAuthApiError)) {
    return "خطای غیرمنتظره‌ای رخ داد. دوباره تلاش کنید.";
  }

  if (error.code === "NETWORK_ERROR") {
    return error.message;
  }

  switch (error.code) {
    case "PHONE_REQUIRED":
    case "INVALID_PHONE":
    case "INVALID_PHONE_NUMBER":
      return "شماره موبایل معتبر نیست.";

    case "OTP_CODE_REQUIRED":
      return "کد تایید را وارد کنید.";

    case "INVALID_OTP_CODE":
    case "OTP_CODE_INVALID":
    case "OTP_INVALID":
    case "UNAUTHORIZED":
      return "کد تایید اشتباه است یا منقضی شده است.";

    case "OTP_EXPIRED":
    case "OTP_CODE_EXPIRED":
    case "OTP_NOT_FOUND":
      return "کد تایید منقضی شده است. دوباره کد بگیرید.";

    case "TOO_MANY_REQUESTS":
    case "OTP_RATE_LIMITED":
      return "تعداد درخواست‌های کد تایید زیاد شده است. کمی بعد دوباره تلاش کنید.";

    case "FORBIDDEN":
    case "ADMIN_ACCOUNT_NOT_FOUND":
    case "ADMIN_ACCOUNT_DISABLED":
    case "ADMIN_ACCOUNT_INACTIVE":
      return "این شماره در لیست ادمین‌های فعال نیست یا اجازه ورود ندارد.";

    case "REFRESH_TOKEN_REQUIRED":
    case "REFRESH_TOKEN_INVALID":
    case "INVALID_REFRESH_TOKEN":
    case "REFRESH_TOKEN_EXPIRED":
      return "نشست ادمین منقضی شده است. لطفاً دوباره وارد شوید.";

    default:
      if (error.status === 403) {
        return "این شماره اجازه ورود به پنل ادمین را ندارد.";
      }

      if (error.status === 401) {
        return "کد تایید اشتباه است یا منقضی شده است.";
      }

      return error.message || "ورود ادمین ناموفق بود.";
  }
}
