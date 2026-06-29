import UserSettingsScreen from "@/shared/components/settings/components/UserSettingsScreen";

export default function ChefSettingsScreen() {
  return (
    <UserSettingsScreen
      role="chef"
      title="اطلاعاتتو مدیریت و بروزرسانی کن!"
      unauthorizedMessage="فقط آشپزها می‌توانند به تنظیمات این بخش دسترسی داشته باشند."
      defaultAvatar="/images/chef.webp"
      successMessage="تغییرات با موفقیت ذخیره شد."
      infoMessage="لطفا اطلاعاتتون رو به صورت کامل وارد کنید تا بهتر دیده بشین و از تمام امکانات دیگچه استفاده کنین."
    />
  );
}