"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import SearchInput from "@/shared/components/SearchInput";
import AdminPanel from "../../components/AdminPanel";
import AdminProfileBadge from "../../components/AdminProfileBadge";
import AdminToggle from "../../components/AdminToggle";
import { chefs } from "../../data/chefs";
import type { AdminChef } from "../../types/admin.types";

export default function AdminChefsScreen() {
  const [searchValue, setSearchValue] = useState("");
  const [chefList, setChefList] = useState<AdminChef[]>(chefs);

  const filteredChefs = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) {
      return chefList;
    }

    return chefList.filter((chef) =>
      chef.fullName.toLowerCase().includes(normalizedSearch)
    );
  }, [chefList, searchValue]);

  const handleToggleChef = (chefId: string, checked: boolean) => {
    setChefList((prevChefs) =>
      prevChefs.map((chef) =>
        chef.id === chefId ? { ...chef, isActive: checked } : chef
      )
    );
  };

  return (
    <AdminPanel
      className="relative"
      contentClassName="relative flex h-full flex-col px-4 py-5 sm:px-7 sm:py-6"
    >
      <AdminProfileBadge className="mx-auto mb-6 shrink-0 md:absolute md:left-4 md:top-4 md:mx-0 md:mb-0" />

      <div className="mx-auto w-full max-w-[430px] shrink-0 md:pt-4">
        <SearchInput
          value={searchValue}
          onChange={setSearchValue}
          placeholder="جستجو در آشپز ها..."
          className="w-full"
        />
      </div>

      <div className="mx-auto mt-12 flex min-h-0 w-full max-w-[560px] flex-1 flex-col gap-3 overflow-y-auto pb-3 pl-2 pr-1">
        {filteredChefs.map((chef) => (
          <ChefRow
            key={chef.id}
            chef={chef}
            onToggle={(checked) => handleToggleChef(chef.id, checked)}
          />
        ))}

        {filteredChefs.length === 0 && (
          <div className="shrink-0 rounded-3xl border border-orange-100 bg-[#FFF9F4] px-4 py-8 text-center text-sm font-bold text-gray-600">
            آشپزی با این مشخصات پیدا نشد.
          </div>
        )}
      </div>
    </AdminPanel>
  );
}

type ChefRowProps = {
  chef: AdminChef;
  onToggle: (checked: boolean) => void;
};

function ChefRow({ chef, onToggle }: ChefRowProps) {
  return (
    <div
      dir="ltr"
      className="grid shrink-0 grid-cols-[54px_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[62px_minmax(0,1fr)]"
    >
      <div className="flex justify-center">
        <AdminToggle checked={chef.isActive} onChange={onToggle} />
      </div>

      <article
        dir="rtl"
        className="flex h-[58px] items-center justify-between rounded-xl border border-gray-200 bg-white px-3 shadow-sm"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-[#F2CDB5]">
            <Image
              src={chef.avatar}
              alt={chef.fullName}
              fill
              className="object-cover"
            />
          </div>

          <h2 className="truncate text-sm font-medium text-gray-950 sm:text-[15px]">
            {chef.fullName}
          </h2>
        </div>
      </article>
    </div>
  );
}