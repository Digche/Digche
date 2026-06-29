// src/shared/settings/components/UserSettingsScreen.tsx

"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera, Info } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import ProfileField from "@/shared/components/ProfileField";

type SettingsRole = "chef" | "customer";

type UserSettingsScreenProps = {
  role: SettingsRole;
  title: string;
  unauthorizedMessage: string;
  defaultAvatar: string;
  successMessage?: string;
  infoMessage?: string;
};

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

const defaultSuccessMessage = "تغییرات با موفقیت ذخیره شد.";

const defaultInfoMessage =
  "لطفا اطلاعاتتون رو به صورت کامل وارد کنید تا بهتر دیده بشین و از تمام امکانات دیگچه استفاده کنین.";

function getSettingsFormFromUser(
  user: ReturnType<typeof useAuthStore.getState>["currentUser"],
  defaultAvatar: string
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

export default function UserSettingsScreen({
  role,
  title,
  unauthorizedMessage,
  defaultAvatar,
  successMessage = defaultSuccessMessage,
  infoMessage = defaultInfoMessage,
}: UserSettingsScreenProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentUser = useAuthStore((state) => state.currentUser);
  const updateCurrentUser = useAuthStore((state) => state.updateCurrentUser);

  const [isSaved, setIsSaved] = useState(false);

  const [form, setForm] = useState<SettingsFormState>(() =>
    getSettingsFormFromUser(currentUser, defaultAvatar)
  );

  useEffect(() => {
    setForm(getSettingsFormFromUser(currentUser, defaultAvatar));
  }, [currentUser, defaultAvatar]);

  if (!currentUser || currentUser.role !== role) {
    return (
      <section className="flex h-full items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">دسترسی غیرمجاز</h1>

          <p className="mt-2 text-sm text-gray-500">{unauthorizedMessage}</p>
        </div>
      </section>
    );
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
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
      ...(role === "chef"
        ? {
            chefDisplayName: form.chefDisplayName.trim(),
          }
        : {}),
    });

    setIsSaved(true);
  };

  const avatarSrc = form.avatar || defaultAvatar;
  const isBase64Avatar = avatarSrc.startsWith("data:");

  const avatarAlt =
    form.chefDisplayName || form.name || form.username || "تصویر پروفایل";

  return (
    <section dir="rtl" className="relative h-full overflow-hidden">
      <div className="h-full overflow-y-auto px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-5">
        <div
          dir="ltr"
          className="mb-3 flex flex-col lg:flex-row lg:items-start lg:justify-between"
        >
          <div className="order-2 text-right lg:order-1 lg:flex-1">
            <h1 dir="rtl" className="font-bold text-gray-950 sm:text-2xl">
              {title}
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
          <div className="mb-3 flex justify-start">
            <div className="relative mx-auto">
              <div className="relative mt-1 h-26 w-26 overflow-hidden rounded-full bg-[#F2CDB5]">
                <Image
                  src={avatarSrc}
                  alt={avatarAlt}
                  fill
                  className="object-cover"
                  unoptimized={isBase64Avatar}
                />
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#E8793E] text-white shadow-md transition hover:bg-[#d96f37]"
                aria-label="تغییر عکس پروفایل"
              >
                <Camera size={15} />
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

          <div className="grid gap-x-20 gap-y-3 px-8 lg:grid-cols-2 lg:px-20">
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
          </div>

          <div className="mt-10 flex justify-center">
            <button
              type="submit"
              className="h-9 w-36 mt-8 rounded-lg bg-[#EFC5A8] text-sm font-bold text-gray-900 transition hover:bg-[#e9b892]"
            >
              ذخیره تغییرات
            </button>
          </div>

          {isSaved && (
            <p className="mt-3 text-center text-sm font-bold text-emerald-600">
              {successMessage}
            </p>
          )}

          <div className="mx-auto mt-8 max-w-4xl rounded-lg border-2 border-dashed border-gray-900/80 bg-[#FFF6B8]/70 px-4 py-3">
            <div className="flex items-center justify-center gap-2 text-center">
              <Info size={17} className="shrink-0 text-gray-900" />

              <p className="text-xs font-medium leading-6 text-gray-900 sm:text-sm">
                {infoMessage}
              </p>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}