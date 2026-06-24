// src/shared/components/SearchInput.tsx

"use client";

import { Search, X } from "lucide-react";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  showClearButton?: boolean;
};

export default function SearchInput({
  value,
  onChange,
  placeholder = "جست و جو...",
  className = "",
  inputClassName = "",
  showClearButton = true,
}: SearchInputProps) {
  return (
    <div className={`relative w-full ${className}`} dir="rtl">
      <div className="pointer-events-none absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#D48B8B] shadow-sm">
        <Search size={17} />
      </div>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`h-12 w-full rounded-2xl border border-[#EFC5A8] bg-[#FFF9F4] pr-13 ${
          showClearButton ? "pl-12" : "pl-4"
        } text-sm font-medium text-gray-800 shadow-[0_8px_24px_rgba(212,139,139,0.12)] outline-none transition placeholder:text-gray-400 hover:border-[#D48B8B]/70 focus:border-[#D48B8B] focus:bg-white focus:shadow-[0_10px_30px_rgba(212,139,139,0.18)] ${inputClassName}`}
      />

      {showClearButton && value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm transition hover:bg-[#FDF7F2] hover:text-gray-900"
          aria-label="پاک کردن جست و جو"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}