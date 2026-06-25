// src/app/(chef)/chef/layout.tsx

import ChefSidebar from "@/features/chef/components/ChefSidebar";

type ChefLayoutProps = {
  children: React.ReactNode;
};

export default function ChefLayout({ children }: ChefLayoutProps) {
  return (
    <div dir="rtl" className="min-h-screen bg-[#FFF9F4]">
      <ChefSidebar />

      <main className="min-h-screen px-4 pb-8 pt-20 md:py-8 md:pr-[370px] md:pl-8">
        <div className="mx-auto w-full lg:max-w-[1500px] ">
          {children}
        </div>
      </main>
    </div>
  );
}