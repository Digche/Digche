import { AuthRouteGuard } from "@/features/auth/components/AuthRouteGuard";
import CustomerSidebar from "@/features/customer/components/CustomerSidebar";

type CustomerLayoutProps = {
  children: React.ReactNode;
};

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  return (
    <AuthRouteGuard allowedRoles={["customer"]}>
      <div dir="rtl" className="min-h-screen bg-[#FFF9F4]">
        <CustomerSidebar />

        <main className="min-h-screen px-4 pb-8 pt-20 md:py-8 md:pr-[370px] md:pl-8">
          <div className="mx-auto w-full lg:max-w-[1500px]">
            {children}
          </div>
        </main>
      </div>
    </AuthRouteGuard>
  );
}