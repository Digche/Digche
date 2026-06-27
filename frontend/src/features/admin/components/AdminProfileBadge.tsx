import Image from "next/image";

type AdminProfileBadgeProps = {
  name?: string;
  avatarSrc?: string;
  className?: string;
};

export default function AdminProfileBadge({
  name = "راضیه اسلامی",
  avatarSrc = "/images/avatars/user-2.webp",
  className = "",
}: AdminProfileBadgeProps) {
  const isBase64Avatar = avatarSrc.startsWith("data:");

  return (
    <div
      dir="rtl"
      className={`flex h-[58px] w-fit min-w-[136px] items-center gap-3 rounded-xl bg-white px-3 shadow-[4px_4px_7px_rgba(0,0,0,0.22)] ${className}`}
    >
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-[#F2CDB5]">
        <Image
          src={avatarSrc}
          alt={name}
          fill
          className="object-cover"
          unoptimized={isBase64Avatar}
        />
      </div>

      <p className="whitespace-nowrap text-[12px] font-medium text-gray-950">
        {name}
      </p>
    </div>
  );
}