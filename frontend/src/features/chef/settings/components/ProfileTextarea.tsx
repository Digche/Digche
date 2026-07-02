// import { ChangeEvent } from "react";
// import { Camera, Info, Pencil, UserRound } from "lucide-react";


// export default function ProfileTextarea({
//   label,
//   name,
//   value,
//   onChange,
//   placeholder,
// }: {
//   label: string;
//   name: string;
//   value: string;
//   onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
//   placeholder: string;
// }) {
//   return (
//     <label className="block">
//       <span className="mb-2 block text-right text-lg font-bold text-gray-900">
//         {label}
//       </span>

//       <div className="relative">
//         <textarea
//           name={name}
//           value={value}
//           onChange={onChange}
//           rows={2}
//           placeholder={placeholder}
//           className="w-full resize-none rounded-xl border border-transparent bg-[#F2CDB5]/55 pr-4 pl-12 py-4 text-right text-sm leading-8 text-gray-800 outline-none transition placeholder:text-gray-500 focus:border-[#D48B8B] focus:bg-[#F2CDB5]/70"
//         />

//         <Pencil size={19} className="absolute left-4 top-5 text-gray-950" />
//       </div>
//     </label>
//   );
// }