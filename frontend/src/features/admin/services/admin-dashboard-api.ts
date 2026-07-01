import { adminApiRequest } from "../auth/services/admin-api-client";
import type { AdminSessionResponse } from "../auth/types/admin-auth.types";
import type { AdminUser } from "../types/admin.types";

const DEFAULT_ADMIN_AVATAR = "/images/avatars/user-2.webp";

type BackendAdminUser = {
  id: string;
  phone: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  role: string;
  status: "active" | "disabled" | string;
  photoUrl?: string | null;
};

type AdminUsersResponse = {
  admins: BackendAdminUser[];
};

type AdminUserResponse = {
  admin: BackendAdminUser;
};

export type CreateAdminInput = {
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
};

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const response = await adminApiRequest<AdminUsersResponse>(
    "/admin/admin-users"
  );

  return response.admins.map(toAdminUser);
}

export async function createAdminUser(
  input: CreateAdminInput
): Promise<AdminUser> {
  const response = await adminApiRequest<AdminUserResponse>(
    "/admin/admin-users",
    {
      method: "POST",
      body: input,
    }
  );

  return toAdminUser(response.admin);
}

export function requestNewAdminPhoneCode(phone: string) {
  return adminApiRequest<{
    message: string;
    phone: string;
    expiresAt: string;
  }>("/admin/admin-users/phone-verification/request-otp", {
    method: "POST",
    body: { phone },
  });
}

export async function verifyNewAdminPhoneCode(phone: string, code: string) {
  const response = await adminApiRequest<{
    verified: boolean;
    phone: string;
  }>("/admin/admin-users/phone-verification/verify", {
    method: "POST",
    body: { phone, code },
  });

  return {
    ...response,
    phone: toLocalIranMobileNumber(response.phone),
  };
}

export async function updateAdminStatus(
  adminId: string,
  isActive: boolean
): Promise<AdminUser> {
  const action = isActive ? "enable" : "disable";

  const response = await adminApiRequest<AdminUserResponse>(
    `/admin/admin-users/${adminId}/${action}`,
    {
      method: "PATCH",
    }
  );

  return toAdminUser(response.admin);
}

export async function updateAdminPhone(
  adminId: string,
  newPhone: string
): Promise<AdminUser> {
  const response = await adminApiRequest<AdminUserResponse>(
    `/admin/admin-users/${adminId}/phone`,
    {
      method: "PATCH",
      body: { newPhone },
    }
  );

  return toAdminUser(response.admin);
}

export function requestOwnAdminPhoneChangeCode(newPhone: string) {
  return adminApiRequest<{
    message: string;
    newPhone: string;
    expiresAt: string;
  }>("/admin/auth/change-phone/request-otp", {
    method: "POST",
    body: { newPhone },
  });
}

export function verifyOwnAdminPhoneChange(
  newPhone: string,
  code: string
): Promise<AdminSessionResponse> {
  return adminApiRequest<AdminSessionResponse>(
    "/admin/auth/change-phone/verify",
    {
      method: "POST",
      body: { newPhone, code },
    }
  );
}

function toAdminUser(admin: BackendAdminUser): AdminUser {
  return {
    id: admin.id,
    fullName: getAdminFullName(admin),
    phone: admin.phone,
    avatar: getSafeAvatar(admin.photoUrl),
    isActive: admin.status === "active",
  };
}

function getAdminFullName(admin: BackendAdminUser) {
  return (
    [admin.firstName, admin.lastName].filter(Boolean).join(" ").trim() ||
    admin.username ||
    admin.phone ||
    "ادمین دیگچه"
  );
}

function getSafeAvatar(photoUrl: string | null | undefined) {
  const value = String(photoUrl || "").trim();

  if (
    value.startsWith("/") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  return DEFAULT_ADMIN_AVATAR;
}


function toLocalIranMobileNumber(value: string) {
  const digits = String(value || "").replace(/\D/g, "");

  if (digits.startsWith("0098") && digits.length === 14) {
    return `0${digits.slice(4)}`;
  }

  if (digits.startsWith("98") && digits.length === 12) {
    return `0${digits.slice(2)}`;
  }

  if (digits.startsWith("9") && digits.length === 10) {
    return `0${digits}`;
  }

  return digits;
}
