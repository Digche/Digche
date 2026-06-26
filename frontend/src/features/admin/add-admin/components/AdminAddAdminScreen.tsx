"use client";

import {
  MOBILE_NUMBER_MAX_LENGTH,
} from "@/shared/validation/phone-number";
import AdminPanel from "../../components/AdminPanel";
import AdminProfileBadge from "../../components/AdminProfileBadge";
import AdminTextInput from "../../components/AdminTextInput";
import { useAddAdminForm } from "../hooks/useAddAdminForm";

export default function AdminAddAdminScreen() {
  const {
    form,
    visibleErrors,
    isFormValid,
    isSubmitting,
    successMessage,
    updateFirstName,
    updateLastName,
    updatePhone,
    updateUsername,
    markFieldAsTouched,
    handleNameKeyDown,
    handlePhoneKeyDown,
    handleUsernameKeyDown,
    handleSubmit,
  } = useAddAdminForm();

  return (
    <AdminPanel
      className="relative"
      contentClassName="relative flex h-full flex-col px-4 py-5 sm:px-7 sm:py-6"
    >
      <AdminProfileBadge className="mx-auto mb-6 shrink-0 md:absolute md:left-4 md:top-4 md:mx-0 md:mb-0" />

      <div className="flex min-h-0 flex-1 items-start justify-center pt-10 md:pt-16">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="w-full max-w-[820px] rounded-lg border-2 border-[#FF6A21] px-5 py-8 md:px-12 md:py-9"
        >
          <h1 className="mb-8 text-center text-xl font-medium text-gray-950">
            اطلاعات ادمین جدید را وارد کنید.
          </h1>

          <div className="grid grid-cols-1 gap-x-20 gap-y-5 md:grid-cols-2">
            <AdminTextInput
              label="نام"
              name="firstName"
              value={form.firstName}
              onChange={updateFirstName}
              onBlur={() => markFieldAsTouched("firstName")}
              onKeyDown={handleNameKeyDown}
              error={visibleErrors.firstName}
              placeholder=" راضیه"
              autoComplete="given-name"
            />

            <AdminTextInput
              label="نام خانوادگی"
              name="lastName"
              value={form.lastName}
              onChange={updateLastName}
              onBlur={() => markFieldAsTouched("lastName")}
              onKeyDown={handleNameKeyDown}
              error={visibleErrors.lastName}
              placeholder=" اسلامی"
              autoComplete="family-name"
            />

            <AdminTextInput
              label="شماره تلفن"
              name="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              autoCorrect="off"
              spellCheck={false}
              maxLength={MOBILE_NUMBER_MAX_LENGTH}
              minLength={MOBILE_NUMBER_MAX_LENGTH}
              pattern="09[0-9]{9}"
              title="شماره موبایل باید با 09 شروع شود و دقیقاً 11 رقم باشد."
              value={form.phone}
              onChange={updatePhone}
              onBlur={() => markFieldAsTouched("phone")}
              onKeyDown={handlePhoneKeyDown}
              error={visibleErrors.phone}
              helperText="شماره باید با 09 شروع شود و ۱۱ رقم باشد."
              placeholder="09123456789"
            />

            <AdminTextInput
              label="نام کاربری"
              name="username"
              type="text"
              inputMode="text"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              pattern="[A-Za-z0-9_]{3,50}"
              title="فقط حروف انگلیسی، اعداد انگلیسی و آندرلاین مجاز هستند."
              value={form.username}
              onChange={updateUsername}
              onBlur={() => markFieldAsTouched("username")}
              onKeyDown={handleUsernameKeyDown}
              error={visibleErrors.username}
              helperText="فقط حروف انگلیسی، عدد انگلیسی و آندرلاین مجاز است."
              placeholder="example_admin"
            />
          </div>

          <div className="mt-8 flex flex-col items-center gap-4">
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`h-9 w-full max-w-[260px] rounded-md border-2 text-sm font-medium transition ${
                !isFormValid || isSubmitting
                  ? "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400"
                  : "border-[#FF6A21] bg-white text-[#FF6A21] hover:bg-[#FFF1EA]"
              }`}
            >
              {isSubmitting ? "در حال افزودن..." : "افزودن ادمین"}
            </button>

            {successMessage && (
              <p className="max-w-[520px] rounded-md bg-green-50 px-4 py-2 text-center text-sm font-medium text-green-600">
                {successMessage}
              </p>
            )}
          </div>
        </form>
      </div>
    </AdminPanel>
  );
}