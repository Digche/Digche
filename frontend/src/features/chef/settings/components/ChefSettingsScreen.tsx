// src/features/chef/settings/components/ChefSettingsScreen.tsx

"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";import Image from "next/image";
import { Camera, Info, Pencil, UserRound } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import ProfileField from "./ProfileField";
import ProfileTextarea from "./ProfileTextarea";
import ChefProfileBadge from "../../components/ChefProfileBadge";

type SettingsFormState = {
  name: string;
  lastName: string;
  username: string;
  phone: string;
  location: string;
  bio: string;
  avatar: string;
  chefDisplayName: string;
};

const defaultAvatar = "/images/chef.webp";

function getSettingsFormFromUser(
  user: ReturnType<typeof useAuthStore.getState>["currentUser"]
): SettingsFormState {
  return {
    name: user?.name ?? "",
    lastName: user?.lastName ?? "",
    username: user?.username ?? "",
    phone: user?.phone ?? "",
    location: user?.location ?? "",
    bio: user?.bio ?? "",
    avatar: user?.avatar ?? defaultAvatar,
    chefDisplayName: user?.chefDisplayName ?? user?.name ?? "",
  };
}

export default function ChefSettingsScreen() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentUser = useAuthStore((state) => state.currentUser);
  const updateCurrentUser = useAuthStore((state) => state.updateCurrentUser);

  const [isSaved, setIsSaved] = useState(false);

  const [form, setForm] = useState<SettingsFormState>(() =>
    getSettingsFormFromUser(currentUser)
  );

  useEffect(() => {
    setForm(getSettingsFormFromUser(currentUser));
  }, [currentUser]);

  if (!currentUser || currentUser.role !== "chef") {
    return (
      <section className="rounded-3xl border border-orange-100 bg-white p-10 text-center shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">دسترسی غیرمجاز</h1>

        <p className="mt-2 text-sm text-gray-500">
          فقط آشپزها می‌توانند به تنظیمات این بخش دسترسی داشته باشند.
        </p>
      </section>
    );
  }

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setIsSaved(false);

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setIsSaved(false);

      setForm((prev) => ({
        ...prev,
        avatar: String(reader.result),
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    updateCurrentUser({
      name: form.name.trim(),
      lastName: form.lastName.trim(),
      username: form.username.trim(),
      phone: form.phone.trim(),
      location: form.location.trim(),
      bio: form.bio.trim(),
      avatar: form.avatar,
      chefDisplayName: form.chefDisplayName.trim(),
    });

    setIsSaved(true);
  };

  const avatarSrc = form.avatar || defaultAvatar;
  const isBase64Avatar = avatarSrc.startsWith("data:");

  return (
    <section
      dir="rtl"
      className="relative overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-sm"
    >
      <div className="absolute inset-0 opacity-60 [background-size:76px_76px]" />

      <div className="relative p-5 sm:p-8 lg:p-10">
        <div dir="ltr" className="mb-8 flex flex-col gap-45 lg:flex-row lg:items-start lg:justify-between">
          <ChefProfileBadge/>
          <div className="my-auto order-2 text-center lg:order-1 lg:flex-1 ">
            <h1 dir="rtl" className=" text-2xl font-bold text-gray-950 sm:text-3xl ">
              اطلاعاتتو مدیریت و بروزرسانی کن!
            </h1>
          </div>

        </div>

        <form onSubmit={handleSubmit} className="mx-auto max-w-5xl">
          <div className="mb-8 flex justify-start">
            <div className="relative mx-auto">
              <div className="relative h-36 w-36 overflow-hidden rounded-full bg-[#F2CDB5]">
                <Image
                  src={avatarSrc}
                  alt={form.chefDisplayName || form.name}
                  fill
                  className="object-cover"
                  unoptimized={isBase64Avatar}
                />
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 flex h-12 w-12 items-center justify-center rounded-full bg-[#E8793E] text-white shadow-md transition hover:bg-[#d96f37]"
                aria-label="تغییر عکس پروفایل"
              >
                <Camera size={20} />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
          </div>

          <div className="grid gap-x-24 gap-y-6 lg:grid-cols-2">
            <ProfileField
              label="نام"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="ایکس"
            />

            <ProfileField
              label="نام خانوادگی"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="ایکس"
            />

            <ProfileField
              label="شماره تلفن"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="09123456789"
              inputMode="tel"
            />

            <ProfileField
              label="نام کاربری"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="ایکس"
            />

            <div className="lg:col-span-2">
              <ProfileField
                label="موقعیت مکانی"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="بابل"
              />
            </div>

            <div className="lg:col-span-2 ">
              <ProfileTextarea
                label="درباره من"
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder="عاشق آشپزی سنتی با مواد تازه و سالم"
              />
            </div>
          </div>

          <div className="mt-9 flex justify-center">
            <button
              type="submit"
              className="h-11 w-full max-w-xs rounded-xl bg-[#EFC5A8] text-base font-bold text-gray-900 transition hover:bg-[#e9b892]"
            >
              ذخیره تغییرات
            </button>
          </div>

          {isSaved && (
            <p className="mt-4 text-center text-sm font-bold text-emerald-600">
              تغییرات با موفقیت ذخیره شد.
            </p>
          )}

          <div className="mx-auto mt-12 max-w-5xl rounded-xl border-2 border-dashed border-gray-900/80 bg-[#FFF6B8]/70 px-5 py-5">
            <div className="flex items-center justify-center gap-2 text-center">
              <Info size={20} className="shrink-0 text-gray-900" />

              <p className="text-sm font-medium leading-7 text-gray-900">
                لطفا اطلاعاتتون رو به صورت کامل وارد کنید تا بهتر دیده بشین و از
                تمام امکانات دیگچه استفاده کنین.
              </p>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}



