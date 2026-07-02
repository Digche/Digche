import UserSettingsScreen from "@/shared/components/settings/components/UserSettingsScreen";

export default function CustomerSettingsScreen() {
  return (
    <UserSettingsScreen
      role="customer"
      title="اطلاعات حساب کاربریت رو مدیریت کن!"
      unauthorizedMessage="فقط مشتری‌ها می‌توانند به تنظیمات این بخش دسترسی داشته باشند."
      defaultAvatar="/images/customer-avatar.webp"
      successMessage="تغییرات با موفقیت ذخیره شد."
      infoMessage="لطفا اطلاعاتتون رو کامل وارد کنید تا سفارش‌ها و آدرس‌های شما بهتر مدیریت بشن."
    />
  );
}