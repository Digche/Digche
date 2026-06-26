import { API_BASE_URL } from "@/config/api";

export type PublicAuthRole = "client" | "chef";
export type FrontendAuthRole = "customer" | "chef";
export type PublicAuthFlow = "login" | "register";

export type ChefStatus = "active" | "suspended" | string;

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
    status: ChefStatus;
  } | null;
};

export type PublicOtpSentResponse = {
  message: string;
  phone: string;
  role: PublicAuthRole;
  flow: PublicAuthFlow;
  expiresAt: string;
};

export type RegistrationRequiredResponse = {
  requiresRegistration: true;
  registrationToken: string;
  phone: string;
  role: PublicAuthRole;
  flow: PublicAuthFlow;
};

export type PublicSessionResponse = {
  requiresRegistration?: false;
  flow?: PublicAuthFlow;
  accessToken: string;
  refreshToken?: string;
  user: PublicUser;
};

export type PublicAuthSuccessResponse = PublicSessionResponse & {
  refreshToken: string;
};

export type PublicAuthResponse =
  | RegistrationRequiredResponse
  | PublicAuthSuccessResponse;

export type PublicProfileUpdateResponse = {
  accessToken: string;
  user: PublicUser;
};

type ErrorResponseBody = {
  error?: {
    code?: string;
    message?: string;
  };
};

type RequestJsonOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  accessToken?: string | null;
  headers?: HeadersInit;
};

export type AuthErrorContext = {
  action?:
    | "requestOtp"
    | "verifyOtp"
    | "completeRegistration"
    | "refresh"
    | "logout"
    | "me"
    | "updateProfile"
    | "changePhone";
  flow?: PublicAuthFlow;
  role?: PublicAuthRole | FrontendAuthRole;
};

export class AuthApiError extends Error {
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
    this.name = "AuthApiError";
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
        options.body === undefined
          ? undefined
          : JSON.stringify(options.body),
    });
  } catch {
    throw new AuthApiError(
      "ارتباط با سرویس احراز هویت برقرار نشد. وضعیت بک‌اند یا آدرس API را بررسی کنید.",
      0,
      "NETWORK_ERROR"
    );
  }

  const responseBody = await readJsonResponse(response);

  if (!response.ok) {
    const errorBody = responseBody as ErrorResponseBody | null;
    const backendMessage = errorBody?.error?.message;
    const code = errorBody?.error?.code;

    throw new AuthApiError(
      backendMessage || getFallbackHttpErrorMessage(response.status),
      response.status,
      code,
      backendMessage
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
  if (status === 404) {
    return "مسیر سرویس احراز هویت پیدا نشد.";
  }

  if (status === 502 || status === 503 || status === 504) {
    return "Gateway یا سرویس احراز هویت در دسترس نیست.";
  }

  if (status >= 500) {
    return "خطای داخلی سرویس احراز هویت.";
  }

  return "ارتباط با سرویس احراز هویت ناموفق بود.";
}

export function toBackendAuthRole(role: FrontendAuthRole): PublicAuthRole {
  return role === "chef" ? "chef" : "client";
}

export function toFrontendAuthRole(role: PublicAuthRole): FrontendAuthRole {
  return role === "chef" ? "chef" : "customer";
}

export function getFrontendRoleLabel(role: FrontendAuthRole | PublicAuthRole) {
  const frontendRole = role === "client" ? "customer" : role;

  return frontendRole === "chef" ? "آشپز" : "مشتری";
}

export function isRegistrationRequiredResponse(
  response: PublicAuthResponse
): response is RegistrationRequiredResponse {
  return response.requiresRegistration === true;
}

export function isPublicAuthSuccessResponse(
  response: PublicAuthResponse
): response is PublicAuthSuccessResponse {
  return (
    response.requiresRegistration !== true &&
    typeof response.accessToken === "string" &&
    response.accessToken.length > 0 &&
    typeof response.refreshToken === "string" &&
    response.refreshToken.length > 0 &&
    Boolean(response.user)
  );
}

export function requestPublicOtp(input: {
  phone: string;
  role: PublicAuthRole;
  flow: PublicAuthFlow;
}) {
  return requestJson<PublicOtpSentResponse>("/auth/request-otp", {
    method: "POST",
    body: input,
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
    body: input,
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
    body: input,
  });
}

export function refreshPublicSession(refreshToken: string) {
  return requestJson<PublicAuthSuccessResponse>("/auth/refresh", {
    method: "POST",
    body: { refreshToken },
  });
}

export function logoutPublicSession(refreshToken: string) {
  return requestJson<{ message: string; success: boolean }>("/auth/logout", {
    method: "POST",
    body: { refreshToken },
  });
}

export function getCurrentPublicUser(accessToken: string) {
  return requestJson<{ user: PublicUser }>("/auth/me", {
    method: "GET",
    accessToken,
  });
}

export function updatePublicFirstName(input: {
  accessToken: string;
  firstName: string;
}) {
  return requestJson<PublicProfileUpdateResponse>("/auth/me/first-name", {
    method: "PATCH",
    accessToken: input.accessToken,
    body: { firstName: input.firstName },
  });
}

export function updatePublicLastName(input: {
  accessToken: string;
  lastName: string;
}) {
  return requestJson<PublicProfileUpdateResponse>("/auth/me/last-name", {
    method: "PATCH",
    accessToken: input.accessToken,
    body: { lastName: input.lastName },
  });
}

export function updatePublicUsername(input: {
  accessToken: string;
  username: string;
}) {
  return requestJson<PublicProfileUpdateResponse>("/auth/me/username", {
    method: "PATCH",
    accessToken: input.accessToken,
    body: { username: input.username },
  });
}

export function updatePublicPhotoUrl(input: {
  accessToken: string;
  photoUrl: string | null;
}) {
  return requestJson<PublicProfileUpdateResponse>("/auth/me/photo-url", {
    method: "PATCH",
    accessToken: input.accessToken,
    body: { photoUrl: input.photoUrl },
  });
}

export function updatePublicAddress(input: {
  accessToken: string;
  address: string | null;
}) {
  return requestJson<PublicProfileUpdateResponse>("/auth/me/address", {
    method: "PATCH",
    accessToken: input.accessToken,
    body: { address: input.address },
  });
}

export function requestPublicPhoneChangeOtp(input: {
  accessToken: string;
  newPhone: string;
}) {
  return requestJson<{
    message: string;
    newPhone: string;
    expiresAt: string;
  }>("/auth/change-phone/request-otp", {
    method: "POST",
    accessToken: input.accessToken,
    body: { newPhone: input.newPhone },
  });
}

export function verifyPublicPhoneChange(input: {
  accessToken: string;
  newPhone: string;
  code: string;
}) {
  return requestJson<PublicAuthSuccessResponse>("/auth/change-phone/verify", {
    method: "POST",
    accessToken: input.accessToken,
    body: {
      newPhone: input.newPhone,
      code: input.code,
    },
  });
}

export function getAuthErrorMessage(
  error: unknown,
  context: AuthErrorContext = {}
) {
  if (!(error instanceof AuthApiError)) {
    return "خطای غیرمنتظره‌ای رخ داد. دوباره تلاش کنید.";
  }

  const roleLabel = context.role
    ? getFrontendRoleLabel(context.role)
    : "انتخاب‌شده";

  if (error.code === "NETWORK_ERROR") {
    return error.message;
  }

  switch (error.code) {
    case "PUBLIC_ACCOUNT_ALREADY_EXISTS":
      return `برای این شماره با نقش ${roleLabel} قبلاً حساب ساخته شده است. لطفاً از بخش ورود استفاده کنید.`;

    case "USERNAME_ALREADY_IN_USE":
      return "این نام کاربری قبلاً استفاده شده است. یک نام کاربری دیگر وارد کنید.";

    case "USER_PROFILE_ALREADY_COMPLETED":
      return "پروفایل این شماره قبلاً تکمیل شده است. برای ورود از بخش ورود استفاده کنید.";

    case "PHONE_ALREADY_IN_USE":
      return "این شماره موبایل قبلاً برای حساب دیگری استفاده شده است.";

    case "INVALID_PUBLIC_ROLE":
      return "نوع کاربر معتبر نیست. لطفاً نقش مشتری یا آشپز را انتخاب کنید.";

    case "INVALID_PUBLIC_AUTH_FLOW":
      return "نوع عملیات معتبر نیست. لطفاً دوباره بین ورود و ثبت‌نام انتخاب کنید.";

    case "OTP_CODE_REQUIRED":
      return "کد تایید را وارد کنید.";

    case "UNAUTHORIZED":
      if (context.action === "verifyOtp") {
        return "کد تایید اشتباه است یا منقضی شده است.";
      }

      if (context.action === "completeRegistration") {
        return "مهلت تکمیل ثبت‌نام تمام شده است. لطفاً دوباره کد تایید بگیرید.";
      }

      if (context.action === "refresh" || context.action === "me") {
        return "نشست کاربری شما منقضی شده است. لطفاً دوباره وارد شوید.";
      }

      return "احراز هویت ناموفق بود. لطفاً دوباره تلاش کنید.";

    case "FORBIDDEN":
      if (isChefSuspendedError(error)) {
        return "حساب آشپز شما تعلیق شده است و فعلاً اجازه ورود ندارید.";
      }

      if (isProfileIncompleteError(error)) {
        return "پروفایل این حساب کامل نیست. لطفاً ابتدا ثبت‌نام را کامل کنید.";
      }

      if (isRoleAccessError(error)) {
        return `این حساب اجازه دسترسی با نقش ${roleLabel} را ندارد.`;
      }

      return "شما اجازه دسترسی به این بخش را ندارید.";

    case "TOO_MANY_REQUESTS":
      return "تعداد درخواست‌های کد تایید زیاد شده است. کمی بعد دوباره تلاش کنید.";

    case "FIRST_NAME_REQUIRED":
      return "نام را وارد کنید.";

    case "LAST_NAME_REQUIRED":
      return "نام خانوادگی را وارد کنید.";

    case "NAME_TOO_LONG":
      return "نام یا نام خانوادگی بیش از حد طولانی است.";

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

    case "REFRESH_TOKEN_REQUIRED":
      return "نشست کاربری معتبر نیست. لطفاً دوباره وارد شوید.";

    case "ADDRESS_TOO_LONG":
      return "آدرس بیش از حد طولانی است.";

    case "PHOTO_URL_TOO_LONG":
      return "آدرس تصویر بیش از حد طولانی است.";

    case "INVALID_PHOTO_URL":
      return "آدرس تصویر معتبر نیست.";

    case "INTERNAL_SERVER_ERROR":
      return "خطای داخلی سرویس احراز هویت. لطفاً لاگ بک‌اند را بررسی کنید.";
      

    default:
      if (error.status === 502 || error.status === 503 || error.status === 504) {
        return "Gateway یا سرویس احراز هویت در دسترس نیست.";
      }

      return error.message || "ارتباط با سرویس احراز هویت ناموفق بود.";
  }
}

function isChefSuspendedError(error: AuthApiError) {
  return String(error.backendMessage || error.message)
    .toLowerCase()
    .includes("chef account is suspended");
}

function isProfileIncompleteError(error: AuthApiError) {
  return String(error.backendMessage || error.message)
    .toLowerCase()
    .includes("profile is not completed");
}

function isRoleAccessError(error: AuthApiError) {
  const message = String(error.backendMessage || error.message).toLowerCase();

  return (
    message.includes("selected role") ||
    message.includes("does not have selected role") ||
    message.includes("permission")
  );
}