"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface PageHeaderProps {
  title: string;
  description?: string;
  backLabel?: string;
}

export default function PageHeader({
  title,
  description,
  backLabel = "بازگشت",
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <header className="mb-6 flex items-center justify-between rounded-3xl border border-orange-100 bg-white px-4 py-4 shadow-sm sm:px-6">
      <div className="text-right">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
          {title}
        </h1>

        {description && (
          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            {description}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-2 rounded-full bg-[#FDF7F2] px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-orange-100"
      >
        <span className="hidden sm:inline">{backLabel}</span>
        <ArrowLeft size={18} />
      </button>
    </header>
  );
}