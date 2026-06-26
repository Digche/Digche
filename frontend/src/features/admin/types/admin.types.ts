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