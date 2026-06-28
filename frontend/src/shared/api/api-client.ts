"use client";

import { API_BASE_URL } from "@/config/api";
import { useAuthStore } from "@/store/auth-store";
import { ApiError, getFallbackHttpErrorMessage } from "./api-error";

type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: HeadersInit;
  auth?: boolean;
};

type ErrorResponseBody = {
  error?: {
    code?: string;
    message?: string;
  };
  code?: string;
  message?: string;
};

async function readJsonResponse(response: Response) {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function extractErrorInfo(errorBody: ErrorResponseBody | null) {
  return {
    code: errorBody?.error?.code || errorBody?.code,
    message: errorBody?.error?.message || errorBody?.message,
  };
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  const isFormData = options.body instanceof FormData;

  if (options.body !== undefined && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth) {
    const token = useAuthStore.getState().accessToken;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
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
          : isFormData
            ? options.body
            : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError(
      "ارتباط با بک‌اند برقرار نشد. آدرس API یا وضعیت سرور را بررسی کنید.",
      0,
      "NETWORK_ERROR"
    );
  }

  const responseBody = await readJsonResponse(response);

  if (!response.ok) {
    const errorBody = responseBody as ErrorResponseBody | null;
    const { code, message } = extractErrorInfo(errorBody);

    throw new ApiError(
      message || getFallbackHttpErrorMessage(response.status),
      response.status,
      code,
      message
    );
  }

  return responseBody as T;
}