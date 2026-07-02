export type AdminRole = "admin" | "manager" | string;

export type AdminApiUser = {
  id: string;
  phone: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  role: AdminRole;
  photoUrl?: string | null;
  isManager: boolean;
};

export type CurrentAdmin = {
  id: string;
  phone: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  role: AdminRole;
  photoUrl: string | null;
  isManager: boolean;
  name: string;
};

export type AdminAuthStatus = "idle" | "checking" | "authenticated" | "guest";

export type AdminOtpSentResponse = {
  message: string;
  phone: string;
  expiresAt: string;
};

export type AdminSessionResponse = {
  accessToken: string;
  refreshToken: string;
  admin: AdminApiUser;
};

export type AdminMeResponse = {
  admin: AdminApiUser;
};


export type AdminProfileUpdateResponse = {
  accessToken: string;
  admin: AdminApiUser;
};
