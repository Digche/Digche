"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import SearchInput from "@/shared/components/SearchInput";
import AdminPanel from "../../components/AdminPanel";
import AdminProfileBadge from "../../components/AdminProfileBadge";
import AdminToggle from "../../components/AdminToggle";
import type { AdminChef } from "../../types/admin.types";
import {
  fetchAdminChefs,
  updateChefStatus,
} from "../../services/admin-dashboard-api";

export default function AdminChefsScreen() {
  const [searchValue, setSearchValue] = useState("");
  const [chefList, setChefList] = useState<AdminChef[]>([]);
  const [isLoadingChefs, setIsLoadingChefs] = useState(true);
  const [chefsError, setChefsError] = useState("");
  const [updatingChefIds, setUpdatingChefIds] = useState<Set<string>>(
    () => new Set()
  );

  useEffect(() => {
    let ignore = false;

    async function loadChefs() {
      try {
        setIsLoadingChefs(true);
        setChefsError("");

        const chefs = await fetchAdminChefs();

        if (!ignore) {
          setChefList(chefs);
        }
      } catch (error) {
        if (!ignore) {
          setChefsError(
            error instanceof Error
              ? error.message
              : "لیست آشپزها دریافت نشد."
          );
        }
      } finally {
        if (!ignore) {
          setIsLoadingChefs(false);
        }
      }
    }

    loadChefs();

    return () => {
      ignore = true;
    };
  }, []);

  const filteredChefs = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) {
      return chefList;
    }

    return chefList.filter((chef) =>
      chef.fullName.toLowerCase().includes(normalizedSearch)
    );
  }, [chefList, searchValue]);

  const handleToggleChef = async (chefId: string, checked: boolean) => {
    if (updatingChefIds.has(chefId)) {
      return;
    }

    const previousChefs = chefList;

    setChefList((prevChefs) =>
      prevChefs.map((chef) =>
        chef.id === chefId ? { ...chef, isActive: checked } : chef
      )
    );

    setUpdatingChefIds((prevIds) => new Set(prevIds).add(chefId));
    setChefsError("");

    try {
      const updatedChef = await updateChefStatus(chefId, checked);

      setChefList((prevChefs) =>
        prevChefs.map((chef) =>
          chef.id === chefId
            ? {
                ...chef,
                isActive: updatedChef.isActive,
              }
            : chef
        )
      );
    } catch (error) {
      setChefList(previousChefs);
      setChefsError(
        error instanceof Error
          ? error.message
          : "تغییر وضعیت آشپز انجام نشد."
      );
    } finally {
      setUpdatingChefIds((prevIds) => {
        const nextIds = new Set(prevIds);
        nextIds.delete(chefId);
        return nextIds;
      });
    }
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
        {isLoadingChefs && (
          <div className="shrink-0 rounded-3xl border border-orange-100 bg-[#FFF9F4] px-4 py-8 text-center text-sm font-bold text-gray-600">
            در حال دریافت آشپزها...
          </div>
        )}

        {chefsError && (
          <div className="shrink-0 rounded-3xl border border-red-100 bg-red-50 px-4 py-4 text-center text-sm font-bold text-red-500">
            {chefsError}
          </div>
        )}

        {filteredChefs.map((chef) => (
          <ChefRow
            key={chef.id}
            chef={chef}
            isUpdating={updatingChefIds.has(chef.id)}
            onToggle={(checked) => handleToggleChef(chef.id, checked)}
          />
        ))}

        {!isLoadingChefs && filteredChefs.length === 0 && (
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
  isUpdating: boolean;
  onToggle: (checked: boolean) => void;
};

function ChefRow({ chef, isUpdating, onToggle }: ChefRowProps) {
  return (
    <div
      dir="ltr"
      className="grid shrink-0 grid-cols-[54px_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[62px_minmax(0,1fr)]"
    >
      <div className="flex justify-center">
        <AdminToggle
          checked={chef.isActive}
          onChange={(checked) => {
            if (!isUpdating) {
              onToggle(checked);
            }
          }}
          className={isUpdating ? "cursor-wait opacity-60" : ""}
        />
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
