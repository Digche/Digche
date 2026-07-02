"use client";

import Image from "next/image";
import { type FormEvent, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Clock,
  Headphones,
  Mail,
  Phone,
  Send,
} from "lucide-react";
import { createSupportTicket } from "../api/support-tickets.api";
import { useAuthStore, type UserRole } from "@/store/auth-store";

type SupportTicketScreenProps = {
  role: UserRole;
};

const faqItems = [
  "چطور می‌توانم وضعیت سفارش را پیگیری کنم؟",
  "چطور اطلاعات حساب کاربری را تغییر بدهم؟",
  "اگر پرداخت ناموفق بود چه کار کنم؟",
  "چطور با پشتیبانی درباره سفارش صحبت کنم؟",
  "چه زمانی پاسخ تیکت را دریافت می‌کنم؟",
];

export default function SupportTicketScreen({ role }: SupportTicketScreenProps) {
  const currentUser = useAuthStore((state) => state.currentUser);

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const profile = useMemo(() => {
    const fallbackName = role === "chef" ? "آشپز دیگچه" : "کاربر دیگچه";

    return {
      name: currentUser?.name || fallbackName,
      avatar:
        currentUser?.photoUrl ||
        currentUser?.avatar ||
        (role === "chef" ? "/images/chef.webp" : "/images/customer-avatar.webp"),
      label: role === "chef" ? "آشپز" : "مشتری",
    };
  }, [currentUser, role]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedSubject = subject.trim();
    const normalizedDescription = description.trim();

    setSuccessMessage("");
    setErrorMessage("");

    if (!normalizedSubject) {
      setErrorMessage("لطفاً موضوع تیکت را وارد کنید.");
      return;
    }

    if (!normalizedDescription) {
      setErrorMessage("لطفاً شرح مشکل را وارد کنید.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createSupportTicket({
        subject: normalizedSubject,
        description: normalizedDescription,
      });

      setSubject("");
      setDescription("");
      setSuccessMessage("تیکت شما با موفقیت ثبت شد. تیم پشتیبانی به‌زودی بررسی می‌کند.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "ثبت تیکت ناموفق بود. لطفاً دوباره تلاش کنید."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="h-full overflow-y-auto bg-white px-4 py-5 text-right sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="inline-flex w-fit items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <div className="relative h-14 w-14 overflow-hidden rounded-full bg-[#FFF1E8]">
              <Image
                src={profile.avatar}
                alt={profile.name}
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>

            <div>
              <p className="text-sm text-gray-500">{profile.label}</p>
              <h2 className="text-base font-bold text-gray-900">{profile.name}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Headphones className="h-9 w-9 text-[#F97316]" />
            <h1 className="text-2xl font-extrabold text-gray-950 sm:text-3xl">
              ما اینجاییم تا بهت کمک کنیم.
            </h1>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[1.4rem] bg-[#FFF1E8] px-4 py-5 sm:px-7 sm:py-8"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="block text-sm font-medium text-gray-900">موضوع</span>
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                maxLength={150}
                placeholder="مثلاً مشکل در سفارش"
                className="h-12 w-full rounded-xl border border-transparent bg-white px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#F97316] focus:ring-4 focus:ring-orange-100"
              />
            </label>

            <div className="hidden md:block" />
          </div>

          <label className="mt-6 block space-y-2">
            <span className="block text-sm font-medium text-gray-900">شرح مشکل</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={2000}
              rows={6}
              placeholder="مشکل یا درخواستت را کامل توضیح بده..."
              className="min-h-36 w-full resize-none rounded-xl border border-transparent bg-white px-4 py-3 text-sm leading-7 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#F97316] focus:ring-4 focus:ring-orange-100"
            />
          </label>

          {errorMessage && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              <CheckCircle2 size={18} />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-full bg-[#F97316] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#EA580C] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={18} />
              <span>{isSubmitting ? "در حال ارسال..." : "ارسال تیکت"}</span>
            </button>
          </div>
        </form>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[1.4rem] bg-[#FFF1E8] p-5 sm:p-6">
            <h2 className="border-b border-gray-300 pb-3 text-center text-xl font-extrabold text-gray-950">
              سوالات متداول
            </h2>

            <div className="mt-3 divide-y divide-gray-300">
              {faqItems.map((question, index) => {
                const isOpen = openFaqIndex === index;

                return (
                  <div key={question}>
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="flex w-full items-center justify-between gap-3 py-3 text-right text-sm font-medium text-gray-900"
                      aria-expanded={isOpen}
                    >
                      <ChevronDown
                        size={18}
                        className={`shrink-0 text-gray-500 transition ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                      <span>{question}</span>
                    </button>

                    {isOpen && (
                      <p className="pb-4 pr-8 text-sm leading-7 text-gray-500">
                        از همین صفحه تیکت ثبت کن تا تیم پشتیبانی موضوع را بررسی کند و پاسخ مناسب بدهد.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[1.4rem] bg-[#FFF1E8] p-5 sm:p-6">
            <h2 className="border-b border-gray-300 pb-3 text-center text-xl font-extrabold text-gray-950">
              راه‌های ارتباطی
            </h2>

            <div className="mt-4 space-y-4">
              <ContactItem
                icon={<Phone size={21} />}
                title="شماره تماس"
                value="01132323233"
              />
              <ContactItem
                icon={<Mail size={21} />}
                title="ایمیل"
                value="support@gmail.com"
              />
              <ContactItem
                icon={<Clock size={21} />}
                title="ساعت پاسخگویی"
                value="همه روزه از ۹ صبح تا ۹ شب"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type ContactItemProps = {
  icon: React.ReactNode;
  title: string;
  value: string;
};

function ContactItem({ icon, title, value }: ContactItemProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-300 pb-4 last:border-b-0 last:pb-0">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gray-400 text-gray-500">
        {icon}
      </div>

      <div>
        <h3 className="text-base font-bold text-gray-950">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">{value}</p>
      </div>
    </div>
  );
}
