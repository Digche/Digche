"use client";

import Image from "next/image";
import { Camera, Images, Upload, X } from "lucide-react";
import type { ChangeEvent } from "react";
import { useRef, useState } from "react";
import type { AdminAvatarOption } from "../data/admin-avatar-options";

type AdminAvatarUploaderProps = {
  avatarSrc: string;
  fullName: string;
  error?: string;
  avatarOptions: AdminAvatarOption[];
  onSelectAvatar: (avatarSrc: string) => void;
  onUploadPhoto: (file: File) => void;
};

export default function AdminAvatarUploader({
  avatarSrc,
  fullName,
  error,
  avatarOptions,
  onSelectAvatar,
  onUploadPhoto,
}: AdminAvatarUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isAvatarListOpen, setIsAvatarListOpen] = useState(false);

  const isBase64OrBlobAvatar =
    avatarSrc.startsWith("data:") || avatarSrc.startsWith("blob:");

  const closePicker = () => {
    setIsPickerOpen(false);
    setIsAvatarListOpen(false);
  };

  const handleOpenPicker = () => {
    setIsPickerOpen((prevState) => !prevState);
    setIsAvatarListOpen(false);
  };

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    onUploadPhoto(file);
    closePicker();
    event.target.value = "";
  };

  const handleSelectAvatar = (selectedAvatarSrc: string) => {
    onSelectAvatar(selectedAvatarSrc);
    closePicker();
  };

  return (
    <div className="relative flex flex-col items-center">
      {isPickerOpen && (
        <button
          type="button"
          onClick={closePicker}
          className="fixed inset-0 z-10 cursor-default bg-transparent"
          aria-label="بستن انتخابگر تصویر"
        />
      )}

      <button
        type="button"
        onClick={handleOpenPicker}
        className="group relative z-20 h-[108px] w-[108px] overflow-hidden rounded-full border border-gray-200 bg-[#F2CDB5] outline-none transition hover:shadow-md focus:ring-2 focus:ring-[#FF6A21]/40"
        aria-label="ویرایش تصویر پروفایل"
      >
        <Image
          src={avatarSrc}
          alt={fullName}
          fill
          priority
          unoptimized={isBase64OrBlobAvatar}
          className="object-cover"
        />

        <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/25">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-gray-950 shadow-sm transition group-hover:scale-105">
            <Camera size={18} />
          </span>
        </span>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="sr-only"
        onChange={handleFileChange}
      />

      <p className="mt-3 text-sm font-medium text-gray-950">{fullName}</p>

      {isPickerOpen && (
        <div className="absolute top-[128px] z-30 w-[260px] rounded-2xl border border-orange-100 bg-white p-3 shadow-[0_12px_32px_rgba(0,0,0,0.16)]">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-950">ویرایش تصویر</p>

            <button
              type="button"
              onClick={closePicker}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFF9F4] text-gray-700 transition hover:bg-[#FFF1EA]"
              aria-label="بستن"
            >
              <X size={15} />
            </button>
          </div>

          {!isAvatarListOpen ? (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleOpenFilePicker}
                className="flex h-10 items-center justify-between rounded-xl bg-[#FFF9F4] px-4 text-sm font-medium text-gray-950 transition hover:bg-[#FFF1EA]"
              >
                <span>انتخاب عکس</span>
                <Upload size={17} />
              </button>

              <button
                type="button"
                onClick={() => setIsAvatarListOpen(true)}
                className="flex h-10 items-center justify-between rounded-xl bg-[#FFF9F4] px-4 text-sm font-medium text-gray-950 transition hover:bg-[#FFF1EA]"
              >
                <span>انتخاب از آواتارها</span>
                <Images size={17} />
              </button>
            </div>
          ) : (
            <div>
              <button
                type="button"
                onClick={() => setIsAvatarListOpen(false)}
                className="mb-3 text-xs font-medium text-[#FF6A21] transition hover:text-[#e85f1d]"
              >
                بازگشت به گزینه‌ها
              </button>

              <div className="grid grid-cols-3 gap-3">
                {avatarOptions.map((avatar) => {
                  const isSelected = avatar.src === avatarSrc;

                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => handleSelectAvatar(avatar.src)}
                      className={`flex flex-col items-center gap-1 rounded-xl border bg-white p-2 transition ${
                        isSelected
                          ? "border-[#FF6A21] shadow-sm"
                          : "border-orange-100 hover:border-[#FF6A21]/60"
                      }`}
                    >
                      <span className="relative h-14 w-14 overflow-hidden rounded-full border border-gray-200 bg-[#F2CDB5]">
                        <Image
                          src={avatar.src}
                          alt={avatar.label}
                          fill
                          className="object-cover"
                        />
                      </span>

                      <span className="text-[10px] font-medium text-gray-600">
                        {avatar.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-2 text-center text-xs font-medium text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}