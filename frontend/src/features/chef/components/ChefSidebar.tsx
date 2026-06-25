"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  ChefHat,
  ClipboardList,
  History,
  MessageSquareText,
  Settings,
  Headphones,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";

const menuItems = [
  {
    title: "داشبورد",
    href: "/chef",
    icon: Home,
    exact: true
  },
  {
    title: "غذاهای من",
    href: "/chef/foods",
    icon: ChefHat,
  },
  {
    title: "سفارش ها",
    href: "/chef/orders",
    icon: ClipboardList,
    exact: true
  },
  {
    title: "تاریخچه سفارشات",
    href: "/chef/orders/history",
    icon: History,
        exact: true

  },
  {
    title: "پیام ها",
    href: "/chef/messages",
    icon: MessageSquareText,
  },
  {
    title: "تنظیمات حساب کاربری",
    href: "/chef/settings",
    icon: Settings,
  },
  {
    title: "پشتیبانی",
    href: "/chef/support",
    icon: Headphones,
  },
];

export default function ChefSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    router.push("/");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed right-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-gray-800 shadow-sm md:hidden"
        aria-label="باز کردن منو"
      >
        <Menu size={24} />
      </button>

      {isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/35 md:hidden"
          aria-label="بستن منو"
        />
      )}

      <aside
        className={`fixed bottom-0 right-0 top-0 z-50 flex w-[82%] max-w-[340px] flex-col rounded-l-[2rem] bg-white px-6 py-6 shadow-xl transition-transform duration-300 md:right-6 md:top-6 md:bottom-6 md:w-[318px] md:max-w-none md:translate-x-0 md:rounded-[1.6rem] md:shadow-sm ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-start justify-between">
          <div className="mx-auto flex flex-col items-center">
            <Link href="/" className="relative h-28 w-32">
              <Image
                src="/icons/Logo.svg"
                alt="دیگچه"
                fill
                className="object-contain"
                priority
              />
          </Link>
            

            <p className="-mt-2 text-sm text-gray-800">بازار غذای خانگی</p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF9F4] text-gray-700 md:hidden"
            aria-label="بستن منو"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-3">
          {menuItems.map((item) => {
            const Icon = item.icon;

          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between rounded-full px-5 py-4 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#F5D8C6] text-gray-950"
                    : "text-gray-800 hover:bg-[#FFF9F4]"
                }`}
              >
                <span>{item.title}</span>
                <Icon size={21} />
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 flex items-center justify-between rounded-full bg-[#D97777] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#cf6969]"
        >
          <span>خروج از حساب</span>
          <LogOut size={21} />
        </button>
      </aside>
    </>
  );
}