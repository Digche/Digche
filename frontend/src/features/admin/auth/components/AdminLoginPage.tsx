import Image from "next/image";
import { Suspense } from "react";
import { AuthHero } from "@/features/auth/components/AuthHero";
import styles from "@/features/auth/components/AuthPage.module.css";
import AdminLoginForm from "./AdminLoginForm";
import AdminLoginRedirectGuard from "./AdminLoginRedirectGuard";

export default function AdminLoginPage() {
  return (
    <main className={styles.authScreen}>
      <section className={styles.authCard} aria-label="ورود ادمین دیگچه">
        <AuthHero />

        <div className={styles.formPanel}>
          <div className={styles.formWrap}>
            <div className={styles.brandHeader}>
              <Image
                src="/images/digcheh-logo.png"
                alt="دیگچه"
                width={150}
                height={110}
                priority
                className={styles.brandLogo}
              />
            </div>

            <Suspense
              fallback={
                <div
                  dir="rtl"
                  className="rounded-2xl bg-[#FFF9F4] px-5 py-4 text-center text-sm font-bold text-gray-700"
                >
                  در حال آماده‌سازی ورود ادمین...
                </div>
              }
            >
              <AdminLoginRedirectGuard>
                <AdminLoginForm />
              </AdminLoginRedirectGuard>
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  );
}
