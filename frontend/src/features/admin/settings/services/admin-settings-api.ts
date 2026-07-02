import { adminApiRequest } from "../../auth/services/admin-api-client";
import type {
  AdminMeResponse,
  AdminProfileUpdateResponse,
  AdminSessionResponse,
} from "../../auth/types/admin-auth.types";

export function fetchAdminSettingsProfile() {
  return adminApiRequest<AdminMeResponse>("/admin/auth/me");
}

export function updateCurrentAdminFirstName(firstName: string) {
  return adminApiRequest<AdminProfileUpdateResponse>("/admin/auth/me/first-name", {
    method: "PATCH",
    body: { firstName },
  });
}

export function updateCurrentAdminLastName(lastName: string) {
  return adminApiRequest<AdminProfileUpdateResponse>("/admin/auth/me/last-name", {
    method: "PATCH",
    body: { lastName },
  });
}

export function updateCurrentAdminUsername(username: string) {
  return adminApiRequest<AdminProfileUpdateResponse>("/admin/auth/me/username", {
    method: "PATCH",
    body: { username },
  });
}

export function updateCurrentAdminPhotoUrl(photoUrl: string | null) {
  return adminApiRequest<AdminProfileUpdateResponse>("/admin/auth/me/photo-url", {
    method: "PATCH",
    body: { photoUrl },
  });
}

export function requestCurrentAdminPhoneChangeCode(newPhone: string) {
  return adminApiRequest<{ message: string; newPhone: string; expiresAt: string }>(
    "/admin/auth/change-phone/request-otp",
    {
      method: "POST",
      body: { newPhone },
    }
  );
}

export function verifyCurrentAdminPhoneChange(newPhone: string, code: string) {
  return adminApiRequest<AdminSessionResponse>("/admin/auth/change-phone/verify", {
    method: "POST",
    body: { newPhone, code },
  });
}
