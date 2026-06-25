export type PublicAuthRole = "client" | "chef";
export type FrontendAuthRole = "customer" | "chef";
export type PublicAuthFlow = "login" | "register";

export type PublicUser = {
  id: string;
  phone: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  photoUrl?: string | null;
  address?: string | null;
  roles: PublicAuthRole[];
  selectedRole: PublicAuthRole;
  chef?: {
    status: "pending" | "active" | "rejected" | "disabled" | string;
  } | null;
};

type PublicOtpSentResponse = {
  message: string;
  phone: string;
  role: PublicAuthRole;
  flow: PublicAuthFlow;
  expiresAt: string;
};

type RegistrationRequiredResponse = {
  requiresRegistration: true;
  registrationToken: string;
  phone: string;
  role: PublicAuthRole;
  flow: PublicAuthFlow;
};

export type PublicAuthSuccessResponse = {
  requiresRegistration?: false;
  flow?: PublicAuthFlow;
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
};

export type PublicAuthResponse =
  | RegistrationRequiredResponse
  | PublicAuthSuccessResponse;

type ErrorResponseBody = {
  error?: {
    code?: string;
    message?: string;
  };
};

export class AuthApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
    this.code = code;
  }
}

const DEFAULT_API_BASE_URL = "http://localhost:8080";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/$/, "");

async function requestJson<ResponseBody>(
  path: string,
  options: RequestInit = {}
): Promise<ResponseBody> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  const responseBody = await readJsonResponse(response);

  if (!response.ok) {
    const errorBody = responseBody as ErrorResponseBody | null;
    const code = errorBody?.error?.code;
    const message =
      errorBody?.error?.message || "ارتباط با سرویس احراز هویت ناموفق بود.";

    throw new AuthApiError(message, response.status, code);
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

export function toBackendAuthRole(role: FrontendAuthRole): PublicAuthRole {
  return role === "chef" ? "chef" : "client";
}

export function toFrontendAuthRole(role: PublicAuthRole): FrontendAuthRole {
  return role === "chef" ? "chef" : "customer";
}

export function requestPublicOtp(input: {
  phone: string;
  role: PublicAuthRole;
  flow: PublicAuthFlow;
}) {
  return requestJson<PublicOtpSentResponse>("/auth/request-otp", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function verifyPublicOtp(input: {
  phone: string;
  code: string;
  role: PublicAuthRole;
  flow: PublicAuthFlow;
}) {
  return requestJson<PublicAuthResponse>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function completePublicRegistration(input: {
  registrationToken: string;
  firstName: string;
  lastName: string;
  username: string;
}) {
  return requestJson<PublicAuthSuccessResponse>("/auth/register/complete", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function refreshPublicSession(refreshToken: string) {
  return requestJson<PublicAuthSuccessResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

export function logoutPublicSession(refreshToken: string) {
  return requestJson<{ message: string; success: boolean }>("/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

export function getCurrentPublicUser(accessToken: string) {
  return requestJson<{ user: PublicUser }>("/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function getAuthErrorMessage(error: unknown) {
  if (!(error instanceof AuthApiError)) {
    return "خطای غیرمنتظره‌ای رخ داد. دوباره تلاش کنید.";
  }

  switch (error.code) {
    case "PUBLIC_ACCOUNT_ALREADY_EXISTS":
      return "برای این شماره و نقش، قبلاً حساب کاربری ساخته شده است. لطفاً وارد شوید.";
    case "USERNAME_ALREADY_IN_USE":
      return "این نام کاربری قبلاً استفاده شده است.";
    case "INVALID_PUBLIC_ROLE":
      return "نوع کاربر معتبر نیست.";
    case "INVALID_PUBLIC_AUTH_FLOW":
      return "نوع عملیات ورود یا ثبت‌نام معتبر نیست.";
    case "OTP_CODE_REQUIRED":
      return "کد تایید را وارد کنید.";
    case "UNAUTHORIZED":
      return "کد تایید اشتباه است یا منقضی شده است.";
    case "FORBIDDEN":
      return "دسترسی شما به این بخش مجاز نیست.";
    case "TOO_MANY_REQUESTS":
      return "تعداد درخواست‌های کد تایید زیاد شده است. کمی بعد دوباره تلاش کنید.";
    case "FIRST_NAME_REQUIRED":
      return "نام را وارد کنید.";
    case "LAST_NAME_REQUIRED":
      return "نام خانوادگی را وارد کنید.";
    case "USERNAME_REQUIRED":
      return "نام کاربری را وارد کنید.";
    case "USERNAME_TOO_SHORT":
      return "نام کاربری باید حداقل ۳ کاراکتر باشد.";
    case "USERNAME_TOO_LONG":
      return "نام کاربری نباید بیشتر از ۵۰ کاراکتر باشد.";
    case "INVALID_USERNAME":
      return "نام کاربری فقط می‌تواند شامل حروف انگلیسی، عدد و آندرلاین باشد.";
    case "REGISTRATION_TOKEN_REQUIRED":
      return "توکن ثبت‌نام پیدا نشد. لطفاً دوباره کد تایید بگیرید.";
    default:
      return error.message || "ارتباط با سرویس احراز هویت ناموفق بود.";
  }
}