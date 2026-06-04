import Image from "next/image";
import styles from "./AuthPage.module.css";

export function AuthHero() {
  return (
    <section className={styles.heroPanel} aria-label="تصویر غذاهای دیگچه">
      <Image
        src="/images/auth-hero.png"
        alt="میز غذای ایرانی دیگچه"
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 49vw"
        className={styles.heroImage}
      />
    </section>
  );
}