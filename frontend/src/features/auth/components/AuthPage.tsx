import Image from "next/image";
import { AuthForm } from "./AuthForm";
import { AuthHero } from "./AuthHero";
import styles from "./AuthPage.module.css";

export function AuthPage() {
  return (
    <main className={styles.authScreen}>
      <section className={styles.authCard} aria-label="ورود و ثبت نام دیگچه">
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

            <AuthForm />
          </div>
        </div>
      </section>
    </main>
  );
}