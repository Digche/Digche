"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import SearchInput from "@/shared/components/SearchInput";
import AdminPanel from "../../components/AdminPanel";
import AdminProfileBadge from "../../components/AdminProfileBadge";
import AdminToggle from "../../components/AdminToggle";
import { adminUsers } from "../../data/admin-users";
import type { AdminUser } from "../../types/admin.types";

export default function AdminDashboardScreen() {
  const [searchValue, setSearchValue] = useState("");
  const [users, setUsers] = useState<AdminUser[]>(adminUsers);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) {
      return users;
    }

    return users.filter((user) => {
      return (
        user.fullName.toLowerCase().includes(normalizedSearch) ||
        user.phone.includes(normalizedSearch)
      );
    });
  }, [searchValue, users]);

  const handleToggleUser = (userId: string, checked: boolean) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, isActive: checked } : user
      )
    );
  };

  return (
    <AdminPanel
      className="relative overflow-hidden"
      contentClassName="relative min-h-[calc(100vh-64px)] px-4 py-5 sm:px-7 sm:py-6"
    >
      <AdminProfileBadge className="mx-auto mb-6 md:absolute md:left-4 md:top-4 md:mx-0 md:mb-0" />

      <div className="mx-auto w-full max-w-[430px] md:pt-4">
        <SearchInput
          value={searchValue}
          onChange={setSearchValue}
          placeholder="جستجو در ادمین ها..."
          className="w-full"
        />
      </div>

      <div className="mx-auto mt-12 flex w-full max-w-[560px] flex-col gap-3">
        {filteredUsers.map((user) => (
          <AdminUserRow
            key={user.id}
            user={user}
            onToggle={(checked) => handleToggleUser(user.id, checked)}
          />
        ))}

        {filteredUsers.length === 0 && (
          <div className="rounded-3xl border border-orange-100 bg-[#FFF9F4] px-4 py-8 text-center text-sm font-bold text-gray-600">
            ادمینی با این مشخصات پیدا نشد.
          </div>
        )}
      </div>
    </AdminPanel>
  );
}

type AdminUserRowProps = {
  user: AdminUser;
  onToggle: (checked: boolean) => void;
};

function AdminUserRow({ user, onToggle }: AdminUserRowProps) {
  return (
    <div
      dir="ltr"
      className="grid grid-cols-[54px_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[62px_minmax(0,1fr)]"
    >
      <div className="flex justify-center">
        <AdminToggle checked={user.isActive} onChange={onToggle} />
      </div>

      <article
        dir="rtl"
        className="flex h-[58px] items-center justify-between rounded-xl border border-gray-200 bg-white px-3 shadow-sm"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-[#F2CDB5]">
            <Image
              src={user.avatar}
              alt={user.fullName}
              fill
              className="object-cover"
            />
          </div>

          <h2 className="truncate text-sm font-medium text-gray-950 sm:text-[15px]">
            {user.fullName}
          </h2>
        </div>

        <button
          type="button"
          className="mr-3 shrink-0 text-[12px] font-medium text-[#E8793E] transition hover:text-[#d96f37]"
        >
          تغییر شماره تلفن
        </button>
      </article>
    </div>
  );
}