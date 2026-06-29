import { ChangeEvent } from "react";
import { Camera, Info, Pencil, UserRound } from "lucide-react";


export default function ProfileField({
  label,
  name,
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  inputMode?: "text" | "tel" | "numeric" | "email";
}) {
  return (
    <label className="block">
      <span className="mt-4 block text-right text-md font-bold text-gray-900">
        {label}
      </span>

      <div className="relative">
        <input
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          inputMode={inputMode}
          className="h-10 w-full mt-1 rounded-xl border border-transparent bg-[#F2CDB5]/55 pr-4 pl-12 text-right text-sm text-gray-800 outline-none transition placeholder:text-gray-500 focus:border-[#D48B8B] focus:bg-[#F2CDB5]/70"
        />

        <Pencil
          size={19}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-950"
        />
      </div>
    </label>
  );
}