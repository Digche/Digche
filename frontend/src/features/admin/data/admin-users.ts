import type { AdminUser } from "../types/admin.types";

export const adminUsers: AdminUser[] = [
  {
    id: "admin-1",
    fullName: "زینب عباسی",
    phone: "09123456781",
    avatar: "/images/avatars/user-1.webp",
    isActive: true,
  },
  {
    id: "admin-2",
    fullName: "مصطفی نصرالله پور",
    phone: "09123456782",
    avatar: "/images/avatars/user-2.webp",
    isActive: true,
  },
  {
    id: "admin-3",
    fullName: "عرشیا محمدزاده",
    phone: "09123456783",
    avatar: "/images/avatars/user-3.webp",
    isActive: false,
  },
  {
    id: "admin-4",
    fullName: "دیبا یانوق",
    phone: "09123456784",
    avatar: "/images/avatars/user-1.webp",
    isActive: true,
  },
];