"use client";

import { MOBILE_NUMBER_MAX_LENGTH } from "@/shared/validation/phone-number";
import PhoneVerificationGlassBox from "@/shared/ui/PhoneVerificationGlassBox";
import AdminPanel from "../../components/AdminPanel";
import AdminProfileBadge from "../../components/AdminProfileBadge";
import AdminTextInput from "../../components/AdminTextInput";
import { adminAvatarOptions } from "../data/admin-avatar-options";
import AdminAvatarUploader from "./AdminAvatarUploader";
import { useAdminSettingsForm } from "../hooks/useAdminSettingsForm";

export default function AdminSettingsScreen() {
  const {
    form,
    savedProfile,
    draftFullName,
    savedFullName,
    visibleErrors,
    canSubmit,
    isLoadingProfile,
    isSubmitting,
    loadError,
    submitError,
    successMessage,
    canEditPhone,
    phoneEditRestrictionMessage,
    isPhoneModalOpen,
    phoneVerificationStep,
    pendingPhone,
    phoneVerificationCode,
    isPhoneVerificationSubmitting,
    phoneVerificationError,
    phoneVerificationResultStatus,
    phoneVerificationResultMessage,
    updateFirstName,
    updateLastName,
    updatePhone,
    updateUsername,
    updateAvatarFromGallery,
    updateAvatarFromFile,
    updatePhoneVerificationCode,
    openPhoneVerification,
    requestPhoneVerificationCode,
    closePhoneVerification,
    verifyPhoneVerificationCode,
    backToPhoneStep,
    showPhoneEditRestriction,
    markFieldAsTouched,
    handleNameKeyDown,
    handleUsernameKeyDown,
    handleSubmit,
  } = useAdminSettingsForm();

  return (
    <AdminPanel
      className="relative"
      contentClassName="relative flex h-full flex-col px-4 py-5 sm:px-7 sm:py-6"
    >
      <AdminProfileBadge
        name={savedFullName || "ادمین"}
        avatarSrc={savedProfile.avatarSrc}
        className="mx-auto mb-6 shrink-0 md:absolute md:left-4 md:top-4 md:mx-0 md:mb-0"
      />

      <div className="flex min-h-0 flex-1 items-start justify-center overflow-y-auto pt-4 md:pt-12">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="w-full max-w-[820px] rounded-lg border-2 border-[#FF6A21] px-5 py-7 md:px-12 md:py-8"
        >
          <AdminAvatarUploader
            avatarSrc={form.avatarSrc}
            fullName={draftFullName || "ادمین"}
            error={visibleErrors.avatar}
            avatarOptions={adminAvatarOptions}
            onSelectAvatar={updateAvatarFromGallery}
            onUploadPhoto={updateAvatarFromFile}
          />

          <h1 className="mb-7 mt-5 text-center text-xl font-medium text-gray-950">
            تنظیمات حساب کاربری
          </h1>

          {isLoadingProfile && (
            <p className="mb-5 rounded-md bg-[#FFF1EA] px-4 py-2 text-center text-sm font-medium text-gray-600">
              در حال دریافت اطلاعات حساب...
            </p>
          )}

          <div className="grid grid-cols-1 gap-x-20 gap-y-5 md:grid-cols-2">
            <AdminTextInput
              label="نام"
              name="firstName"
              value={form.firstName}
              onChange={updateFirstName}
              onBlur={() => markFieldAsTouched("firstName")}
              onKeyDown={handleNameKeyDown}
              error={visibleErrors.firstName}
              placeholder="مثلاً راضیه"
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
              placeholder="مثلاً اسلامی"
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
              readOnly
              maxLength={MOBILE_NUMBER_MAX_LENGTH}
              minLength={MOBILE_NUMBER_MAX_LENGTH}
              pattern="09[0-9]{9}"
              title="برای تغییر شماره موبایل روی این فیلد کلیک کنید."
              value={form.phone}
              onChange={() => undefined}
              onFocus={canEditPhone ? openPhoneVerification : showPhoneEditRestriction}
              onClick={canEditPhone ? openPhoneVerification : showPhoneEditRestriction}
              onBlur={() => markFieldAsTouched("phone")}
              error={visibleErrors.phone}
              helperText={phoneEditRestrictionMessage || undefined}
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
              disabled={!canSubmit}
              className={`h-9 w-full max-w-[260px] rounded-md border-2 text-sm font-medium transition ${
                !canSubmit
                  ? "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400"
                  : "border-[#FF6A21] bg-white text-[#FF6A21] hover:bg-[#FFF1EA]"
              }`}
            >
              {isSubmitting ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </button>

            {successMessage && (
              <p className="max-w-[520px] rounded-md bg-green-50 px-4 py-2 text-center text-sm font-medium text-green-600">
                {successMessage}
              </p>
            )}

            {(loadError || submitError) && (
              <p className="max-w-[520px] rounded-md bg-red-50 px-4 py-2 text-center text-sm font-medium text-red-500">
                {loadError || submitError}
              </p>
            )}
          </div>
        </form>
      </div>

      <PhoneVerificationGlassBox
        isOpen={isPhoneModalOpen}
        step={phoneVerificationStep}
        title="ویرایش شماره موبایل"
        description={
          phoneVerificationStep === "phone"
            ? "شماره موبایل جدید را وارد کنید تا کد تایید برایتان ارسال شود."
            : "کد تایید ارسال‌شده به شماره جدید را وارد کنید."
        }
        phone={pendingPhone}
        code={phoneVerificationCode}
        isSubmitting={isPhoneVerificationSubmitting}
        errorMessage={phoneVerificationError}
        resultStatus={phoneVerificationResultStatus}
        resultMessage={phoneVerificationResultMessage}
        resultAutoCloseMs={2200}
        phoneLabel="شماره موبایل جدید"
        codeLabel="کد تایید"
        requestCodeText="دریافت کد تایید"
        verifyCodeText="تایید شماره"
        onPhoneChange={updatePhone}
        onCodeChange={updatePhoneVerificationCode}
        onRequestCode={requestPhoneVerificationCode}
        onVerifyCode={verifyPhoneVerificationCode}
        onBackToPhone={backToPhoneStep}
        onClose={closePhoneVerification}
      />
    </AdminPanel>
  );
}
