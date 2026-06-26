import AdminSidebar from "@/features/admin/components/AdminSidebar";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div dir="rtl" className="min-h-screen bg-[#FFF9F4] md:h-screen md:overflow-hidden">
      <AdminSidebar />

      <main className="min-h-screen px-4 pb-8 pt-20 md:h-screen md:min-h-0 md:overflow-hidden md:py-6 md:pr-[370px] md:pl-8">
        <div className="mx-auto h-full w-full lg:max-w-[1500px]">{children}</div>
      </main>
    </div>
  );
}