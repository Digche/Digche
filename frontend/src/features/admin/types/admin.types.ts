import type { LucideIcon } from "lucide-react";

export type AdminMenuItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
};

export type AdminUser = {
  id: string;
  fullName: string;
  phone: string;
  avatar: string;
  isActive: boolean;
};

export type AdminChef = {
  id: string;
  fullName: string;
  avatar: string;
  isActive: boolean;
};

export type SupportMessageStatus = "reviewed" | "pending";

export type SupportMessageRole = "مشتری" | "آشپز";

export type AdminSupportMessage = {
  id: string;
  userFullName: string;
  userAvatar: string;
  role: SupportMessageRole;
  subject: string;
  date: string;
  status: SupportMessageStatus;
  isSeen: boolean;
  message: string;
  time: string;
  adminReply?: string;
};