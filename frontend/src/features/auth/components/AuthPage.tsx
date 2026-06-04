import Image from "next/image";
import { AuthForm } from "./AuthForm";
import { AuthHero } from "./AuthHero";
import styles from "./AuthPage.module.css";


export function AuthPage() {
  return (
    <main className={styles.authScreen}>
      <section className={styles.authCard} aria-label="ورود به دیگچه">
        <AuthHero />

        <div className={styles.formPanel}>
          <div className={styles.formWrap}>
            <header className={styles.titleBlock}>
             <h1 className={styles.title}>
                <span className={styles.titleText}>به</span>

                <Image
                    src="/images/digcheh-logo.png"
                    alt="دیگچه"
                    width={165}
                    height={80}
                    priority
                    className={styles.brandLogo}
                />

                <span className={styles.titleText}>خوش آمدید!</span>
            </h1>

              <div className={styles.titleDivider} aria-hidden="true" />
            </header>

            <AuthForm />
          </div>
        </div>
      </section>
    </main>
  );
}