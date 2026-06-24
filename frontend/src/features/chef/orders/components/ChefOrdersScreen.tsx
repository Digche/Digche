// src/features/chef/orders/components/ChefOrdersScreen.tsx

"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useAuthStore } from "@/store/auth-store";
import { useOrderStore } from "@/store/order-store";
import SearchInput from "@/shared/components/SearchInput";
import ChefOrderCard from "./ChefOrderCard";

function isValidDate(value: string | Date) {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function formatPersianDate(value: string | Date) {
  if (!isValidDate(value)) return "";

  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

function formatPersianTime(value: string | Date) {
  if (!isValidDate(value)) return "";

  return new Intl.DateTimeFormat("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatOrderDateTime(value?: string) {
  if (!value) return "";

  const date = formatPersianDate(value);
  const time = formatPersianTime(value);

  if (!date && !time) return "";
  if (!time) return date;
  if (!date) return time;

  return `${date} - ساعت ${time}`;
}

export default function ChefOrdersScreen() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const orders = useOrderStore((state) => state.orders);

  const [searchTerm, setSearchTerm] = useState("");

  const today = formatPersianDate(new Date());

  const chefOrders = useMemo(() => {
    if (!currentUser || currentUser.role !== "chef") return [];

    const normalizedSearch = searchTerm.trim().toLowerCase();

    return orders
      .filter((order) => Number(order.chefId) === Number(currentUser.id))
      .filter((order) => {
        if (!normalizedSearch) return true;

        const orderDateTime = formatOrderDateTime(order.orderedAt).toLowerCase();

        return (
          order.customerName.toLowerCase().includes(normalizedSearch) ||
          order.foodTitle.toLowerCase().includes(normalizedSearch) ||
          orderDateTime.includes(normalizedSearch)
        );
      });
  }, [orders, currentUser, searchTerm]);

  if (!currentUser || currentUser.role !== "chef") {
    return (
      <section className="rounded-3xl border border-orange-100 bg-white p-10 text-center shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">دسترسی غیرمجاز</h1>

        <p className="mt-2 text-sm text-gray-500">
          فقط آشپزها می‌توانند سفارش‌ها را ببینند.
        </p>
      </section>
    );
  }

  return (
    <section
      dir="rtl"
      className="relative overflow-hidden rounded-[1.7rem] border border-orange-100 bg-white shadow-sm"
    >
      <div className="relative px-5 py-7 sm:px-8 lg:px-10">
        <div
          dir="ltr"
          className="mb-16 grid gap-6 lg:grid-cols-[1fr_420px_1fr] lg:items-start"
        >
          <div className="order-2 flex justify-center lg:order-1 lg:justify-start">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="جست و جو در سفارش ها..."
              className="max-w-[420px]"
            />
          </div>

          <div className="order-1 text-center lg:order-3 lg:text-right">
            <div className="flex flex-col items-center justify-center gap-3 lg:justify-end">
              <div className="flex flex-row items-center gap-2">
                <h1 className="text-3xl font-extrabold text-gray-950">
                  سفارش ها
                </h1>

                <div className="relative h-12 w-12">
                  <Image
                    src="/icons/orders.svg"
                    alt="سفارش ها"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              <p className="mt-2 text-sm text-gray-500">{today}</p>
            </div>
          </div>

          <div className="hidden lg:block" />
        </div>

        <div className="mx-auto max-w-[880px]">
          <div className="mb-5 hidden h-14 items-center rounded-xl bg-[#F4D692] px-6 shadow-sm md:grid md:grid-cols-[1.35fr_1fr_1fr_90px] md:gap-4">
            <p className="text-center text-xl font-bold text-gray-950">
              مشتری
            </p>

            <p className="text-center text-xl font-bold text-gray-950">غذا</p>

            <p className="text-center text-xl font-bold text-gray-950">
              وضعیت
            </p>

            <p className="text-center text-xl font-bold text-gray-950">تعداد</p>
          </div>

          {chefOrders.length === 0 ? (
            <div className="rounded-3xl border border-orange-100 bg-[#FFF9F4] p-10 text-center">
              <h2 className="text-xl font-bold text-gray-800">
                سفارشی برای نمایش وجود ندارد
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                هنوز سفارشی ثبت نشده یا نتیجه‌ای برای جست‌وجوی شما پیدا نشد.
              </p>
            </div>
          ) : (
            <div className="max-h-[610px] space-y-3 overflow-y-auto pb-2 pl-2">
              {chefOrders.map((order) => (
                <ChefOrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}