import type { LucideIcon } from "lucide-react";

type DashboardStatCardProps = {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  cardClassName: string;
  iconClassName: string;
};

export default function DashboardStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  cardClassName,
  iconClassName,
}: DashboardStatCardProps) {
  return (
    <article
      className={`relative h-[82px] w-[112px] rounded-md px-3 py-2 text-right shadow-[0_2px_5px_rgba(0,0,0,0.18)] ${cardClassName}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-medium text-gray-900">{title}</span>

        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${iconClassName}`}
        >
          <Icon size={15} strokeWidth={2} />
        </span>
      </div>

      <p className="mt-2 text-center text-[20px] font-medium leading-none text-gray-950">
        {value}
      </p>

      <p className="mt-2 text-center text-[10px] font-medium text-gray-900">
        {subtitle}
      </p>
    </article>
  );
}