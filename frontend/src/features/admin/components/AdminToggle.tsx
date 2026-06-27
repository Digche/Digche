"use client";

type AdminToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
};

export default function AdminToggle({
  checked,
  onChange,
  label = "تغییر وضعیت",
  className = "",
}: AdminToggleProps) {
  return (
    <button
      type="button"
      dir="ltr"
      onClick={() => onChange(!checked)}
      className={`relative h-[26px] w-[49px] rounded-full transition ${
        checked ? "bg-[#A6E9A8]" : "bg-[#FFA3AA]"
      } ${className}`}
      aria-label={label}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-[1px] h-6 w-6 rounded-full transition-all ${
          checked ? "right-[1px] bg-[#08C42D]" : "left-[1px] bg-[#FF2026]"
        }`}
      />
    </button>
  );
}