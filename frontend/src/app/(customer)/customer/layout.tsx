import { AuthRouteGuard } from "@/features/auth/components/AuthRouteGuard";
import CustomerSidebar from "@/features/customer/components/CustomerSidebar";

type CustomerLayoutProps = {
  children: React.ReactNode;
};

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  return (
    <AuthRouteGuard allowedRoles={["customer"]}>
      <div dir="rtl" className="h-screen overflow-hidden bg-[#FFF9F4]">
        <CustomerSidebar />

        <main className="h-screen overflow-hidden px-4 pb-8 pt-20 md:px-6 md:py-6 md:pr-[370px]">
          <div className="h-full overflow-hidden rounded-[1.6rem] border border-orange-100 bg-white shadow-sm">
            {children}
          </div>
        </main>
      </div>
    </AuthRouteGuard>
  );
}