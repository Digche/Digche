"use client";

import type { InputHTMLAttributes, KeyboardEvent } from "react";
import { Pencil } from "lucide-react";

type AdminTextInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> & {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  error?: string;
  helperText?: string;
  className?: string;
  inputClassName?: string;
};

export default function AdminTextInput({
  label,
  id,
  value,
  onChange,
  onKeyDown,
  error,
  helperText,
  placeholder = "",
  type = "text",
  name,
  className = "",
  inputClassName = "text-gray-950",
  ...props
}: AdminTextInputProps) {
  const inputId = id ?? name;
  const descriptionId = inputId ? `${inputId}-description` : undefined;
  const hasDescription = Boolean(error || helperText);

  return (
    <label className={`block w-full ${className}`} htmlFor={inputId}>
      <span className="mb-2 block text-right text-sm font-medium text-gray-950">
        {label}
      </span>

      <div
        className={`flex h-10 items-center rounded-md border px-3 transition ${
          error
            ? "border-red-400 bg-red-50"
            : "border-transparent bg-[#FFF1EA] focus-within:border-[#FF6A21]"
        }`}
      >
        <Pencil
          size={16}
          className={`shrink-0 ${error ? "text-red-500" : "text-gray-950"}`}
        />

        <input
          id={inputId}
          dir="rtl"
          name={name}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={hasDescription ? descriptionId : undefined}
          className={`h-full min-w-0 flex-1 bg-transparent pr-3 text-right text-sm ${inputClassName} outline-none placeholder:text-gray-400 selection:bg-[#FFD8C4] selection:text-gray-950 ${
            error
              ? "[&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_#FEF2F2_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#111827]"
              : "[&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_#FFF1EA_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#111827]"
          } [&:-webkit-autofill]:caret-gray-950 [&:-webkit-autofill]:transition-[background-color] [&:-webkit-autofill]:duration-[9999s]`}
          {...props}
        />
      </div>

      {hasDescription && (
        <p
          id={descriptionId}
          className={`mt-1 min-h-5 text-right text-xs leading-5 ${
            error ? "text-red-500" : "text-gray-500"
          }`}
        >
          {error ?? helperText}
        </p>
      )}
    </label>
  );
}