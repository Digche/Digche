"use client";

import type { FormEvent } from "react";
import { useEffect } from "react";
import {
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Loader2,
  PencilLine,
  Phone,
  RotateCcw,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";
import { isValidIranMobileNumber } from "@/shared/validation/phone-number";

export type PhoneVerificationStep = "phone" | "verification";
export type PhoneVerificationResultStatus = "idle" | "success" | "error";

type PhoneVerificationGlassBoxProps = {
  isOpen: boolean;
  step: PhoneVerificationStep;
  resultStatus?: PhoneVerificationResultStatus;
  resultMessage?: string;
  resultAutoCloseMs?: number;
  title?: string;
  description?: string;
  phone: string;
  code: string;
  isSubmitting?: boolean;
  errorMessage?: string;
  phoneLabel?: string;
  codeLabel?: string;
  phonePlaceholder?: string;
  codePlaceholder?: string;
  requestCodeText?: string;
  verifyCodeText?: string;
  onPhoneChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onRequestCode: () => void;
  onVerifyCode: () => void;
  onBackToPhone?: () => void;
  onRetry?: () => void;
  onClose: () => void;
};

const DEFAULT_AUTO_CLOSE_MS = 3500;

export default function PhoneVerificationGlassBox({
  isOpen,
  step,
  resultStatus = "idle",
  resultMessage = "",
  resultAutoCloseMs = DEFAULT_AUTO_CLOSE_MS,
  title = "ویرایش شماره تماس",
  description = "برای تغییر شماره تماس، ابتدا شماره جدید را وارد کنید و سپس کد تایید را بزنید.",
  phone,
  code,
  isSubmitting = false,
  errorMessage = "",
  phoneLabel = "شماره تماس",
  codeLabel = "کد تایید",
  phonePlaceholder = "09123456789",
  codePlaceholder = "123456",
  requestCodeText = "دریافت کد تایید",
  verifyCodeText = "تایید شماره تماس",
  onPhoneChange,
  onCodeChange,
  onRequestCode,
  onVerifyCode,
  onBackToPhone,
  onRetry,
  onClose,
}: PhoneVerificationGlassBoxProps) {
  const isPhoneStep = step === "phone";
  const normalizedPhone = normalizeDigits(phone).slice(0, 11);
  const normalizedCode = normalizeDigits(code).slice(0, 6);
  const hasPhoneValue = normalizedPhone.length > 0;
  const hasCodeValue = normalizedCode.length > 0;
  const isPhoneValid = isValidIranMobileNumber(normalizedPhone);
  const isCodeValid = /^\d{4,6}$/.test(normalizedCode);
  const isResultVisible = resultStatus === "success" || resultStatus === "error";

  useEffect(() => {
    if (!isOpen || !isResultVisible) {
      return;
    }

    const timer = window.setTimeout(onClose, resultAutoCloseMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isOpen, isResultVisible, onClose, resultAutoCloseMs]);

  if (!isOpen) return null;

  const submitText = isSubmitting
    ? "در حال بررسی..."
    : isPhoneStep
      ? requestCodeText
      : verifyCodeText;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting || isResultVisible) return;

    if (isPhoneStep) {
      if (!isPhoneValid) return;
      onRequestCode();
      return;
    }

    if (!isCodeValid) return;
    onVerifyCode();
  }

  function handlePhoneChange(value: string) {
    onPhoneChange(normalizeDigits(value).replace(/\D/g, "").slice(0, 11));
  }

  function handleCodeChange(value: string) {
    onCodeChange(normalizeDigits(value).replace(/\D/g, "").slice(0, 6));
  }

  function handleRetry() {
    if (onRetry) {
      onRetry();
      return;
    }

    onBackToPhone?.();
  }

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4 py-6 backdrop-blur-sm"
    >
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-[460px] overflow-hidden rounded-[28px] border border-white/60 bg-white/75 p-6 text-right shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur-2xl"
      >
        <button
          type="button"
          aria-label="بستن"
          onClick={onClose}
          className="absolute left-5 top-5 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/70 text-slate-700 shadow-sm transition hover:bg-white"
        >
          <X size={20} />
        </button>

        {isResultVisible ? (
          <ResultView
            status={resultStatus}
            message={resultMessage}
            autoCloseMs={resultAutoCloseMs}
            onClose={onClose}
            onRetry={handleRetry}
          />
        ) : (
          <>
            <div className="mb-7 flex items-start gap-4 pl-12">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-[#FFF1E8] text-[#F26A2E] shadow-sm">
                {isPhoneStep ? (
                  <>
                    <Phone size={25} strokeWidth={2.4} />
                    <PencilLine
                      size={14}
                      strokeWidth={2.8}
                      className="absolute -bottom-1 -left-1 rounded-full bg-white text-[#F26A2E]"
                    />
                  </>
                ) : (
                  <ShieldCheck size={27} strokeWidth={2.4} />
                )}
              </div>

              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  {title}
                </h2>
                <p className="mt-2 text-sm font-semibold leading-7 text-slate-500">
                  {description}
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {isPhoneStep ? (
                <label className="block">
                  <span className="mb-2 block text-sm font-extrabold text-slate-700">
                    {phoneLabel}
                  </span>

                  <div
                    className={`flex items-center gap-3 rounded-3xl border bg-white/70 px-4 py-3 shadow-sm transition ${
                      hasPhoneValue && !isPhoneValid
                        ? "border-red-200 ring-2 ring-red-100"
                        : hasPhoneValue && isPhoneValid
                          ? "border-green-200 ring-2 ring-green-100"
                          : "border-orange-100"
                    }`}
                  >
                    <Phone size={20} className="text-[#F26A2E]" />
                    <input
                      value={normalizedPhone}
                      disabled={isSubmitting}
                      onChange={(event) => handlePhoneChange(event.target.value)}
                      placeholder={phonePlaceholder}
                      inputMode="numeric"
                      maxLength={11}
                      className="min-w-0 flex-1 bg-transparent text-center text-lg font-extrabold text-slate-900 outline-none placeholder:text-slate-300"
                    />
                  </div>

                  {hasPhoneValue && !isPhoneValid && (
                    <p className="mt-2 text-xs font-extrabold text-red-500">
                      شماره موبایل باید ۱۱ رقم و با 09 شروع شود.
                    </p>
                  )}
                </label>
              ) : (
                <label className="block">
                  <span className="mb-2 block text-sm font-extrabold text-slate-700">
                    {codeLabel}
                  </span>

                  <div
                    className={`flex items-center gap-3 rounded-3xl border bg-white/70 px-4 py-3 shadow-sm transition ${
                      hasCodeValue && !isCodeValid
                        ? "border-red-200 ring-2 ring-red-100"
                        : hasCodeValue && isCodeValid
                          ? "border-green-200 ring-2 ring-green-100"
                          : "border-orange-100"
                    }`}
                  >
                    <KeyRound size={20} className="text-[#F26A2E]" />
                    <input
                      value={normalizedCode}
                      disabled={isSubmitting}
                      onChange={(event) => handleCodeChange(event.target.value)}
                      placeholder={codePlaceholder}
                      inputMode="numeric"
                      maxLength={6}
                      className="min-w-0 flex-1 bg-transparent text-center text-lg font-extrabold tracking-[0.3em] text-slate-900 outline-none placeholder:text-slate-300"
                    />
                  </div>

                  {hasCodeValue && !isCodeValid && (
                    <p className="mt-2 text-xs font-extrabold text-red-500">
                      کد تایید باید بین ۴ تا ۶ رقم باشد.
                    </p>
                  )}
                </label>
              )}
            </div>

            {errorMessage && (
              <p className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-center text-sm font-extrabold leading-7 text-red-600">
                {errorMessage}
              </p>
            )}

            {!isPhoneStep && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onBackToPhone}
                className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-slate-500 transition hover:text-[#F26A2E]"
              >
                <ArrowRight size={18} />
                تغییر شماره
              </button>
            )}

            <button
              type="submit"
              disabled={
                isSubmitting || (isPhoneStep ? !isPhoneValid : !isCodeValid)
              }
              className="mt-7 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#8BC34A] text-base font-extrabold text-slate-950 shadow-sm transition hover:bg-[#7DB63D] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && <Loader2 size={20} className="animate-spin" />}
              {submitText}
            </button>
          </>
        )}
      </form>
    </div>
  );
}

function ResultView({
  status,
  message,
  autoCloseMs,
  onClose,
  onRetry,
}: {
  status: Exclude<PhoneVerificationResultStatus, "idle">;
  message: string;
  autoCloseMs: number;
  onClose: () => void;
  onRetry: () => void;
}) {
  const isSuccess = status === "success";
  const Icon = isSuccess ? CheckCircle2 : XCircle;
  const buttonText = isSuccess ? "بستن" : "تلاش مجدد";

  return (
    <div className="pt-12 text-center">
      <div
        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-3xl ${
          isSuccess
            ? "bg-green-50 text-green-600"
            : "bg-red-50 text-red-600"
        }`}
      >
        <Icon size={34} strokeWidth={2.4} />
      </div>

      <h2 className="mt-5 text-xl font-extrabold text-slate-900">
        {isSuccess ? "شماره تماس با موفقیت ثبت شد" : "ویرایش شماره تماس ناموفق بود"}
      </h2>

      <p className="mx-auto mt-3 max-w-[330px] text-sm font-semibold leading-7 text-slate-500">
        {message ||
          (isSuccess
            ? "تا چند لحظه دیگر این پنجره بسته می‌شود."
            : "در صورت نیاز دوباره تلاش کنید.")}
      </p>

      <button
        type="button"
        onClick={isSuccess ? onClose : onRetry}
        className={`relative mt-7 h-14 w-full overflow-hidden rounded-full text-base font-extrabold shadow-sm ${
          isSuccess
            ? "bg-green-100 text-green-950"
            : "bg-red-100 text-red-950"
        }`}
      >
        <span
          className={`absolute inset-y-0 right-0 ${
            isSuccess ? "bg-green-400" : "bg-red-300"
          }`}
          style={{
            animation: `phone-verification-progress ${autoCloseMs}ms linear forwards`,
          }}
        />
        <span className="relative z-10 inline-flex items-center justify-center gap-2">
          {!isSuccess && <RotateCcw size={18} />}
          {buttonText}
        </span>
      </button>

      <style jsx>{`
        @keyframes phone-verification-progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

function normalizeDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}
