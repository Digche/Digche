"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { PencilLine, Phone } from "lucide-react";
import SearchInput from "@/shared/components/SearchInput";
import PhoneVerificationGlassBox, {
  type PhoneVerificationResultStatus,
  type PhoneVerificationStep,
} from "@/shared/ui/PhoneVerificationGlassBox";
import { isValidIranMobileNumber } from "@/shared/validation/phone-number";
import AdminPanel from "../../components/AdminPanel";
import AdminProfileBadge from "../../components/AdminProfileBadge";
import AdminToggle from "../../components/AdminToggle";
import type { AdminUser } from "../../types/admin.types";
import { useAdminAuthStore } from "../../auth/store/admin-auth-store";
import {
  fetchAdminUsers,
  requestOwnAdminPhoneChangeCode,
  updateAdminPhone,
  updateAdminStatus,
  verifyOwnAdminPhoneChange,
} from "../../services/admin-dashboard-api";

type EditableAdminPhone = {
  id: string;
  name: string;
  isSelf: boolean;
};

export default function AdminDashboardScreen() {
  const currentAdmin = useAdminAuthStore((state) => state.currentAdmin);
  const setAdminSession = useAdminAuthStore((state) => state.setSession);

  const [searchValue, setSearchValue] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState("");
  const [updatingUserIds, setUpdatingUserIds] = useState<Set<string>>(
    () => new Set()
  );

  const [editingAdminPhone, setEditingAdminPhone] =
    useState<EditableAdminPhone | null>(null);
  const [phoneVerificationStep, setPhoneVerificationStep] =
    useState<PhoneVerificationStep>("phone");
  const [newAdminPhone, setNewAdminPhone] = useState("");
  const [adminPhoneCode, setAdminPhoneCode] = useState("");
  const [isPhoneVerificationSubmitting, setIsPhoneVerificationSubmitting] =
    useState(false);
  const [phoneVerificationError, setPhoneVerificationError] = useState("");
  const [phoneVerificationResultStatus, setPhoneVerificationResultStatus] =
    useState<PhoneVerificationResultStatus>("idle");
  const [phoneVerificationResultMessage, setPhoneVerificationResultMessage] =
    useState("");

  useEffect(() => {
    let ignore = false;

    async function loadAdminUsers() {
      try {
        setIsLoadingUsers(true);
        setUsersError("");

        const adminUsers = await fetchAdminUsers();

        if (!ignore) {
          setUsers(adminUsers);
        }
      } catch (error) {
        if (!ignore) {
          setUsersError(
            error instanceof Error
              ? error.message
              : "لیست ادمین‌ها دریافت نشد."
          );
        }
      } finally {
        if (!ignore) {
          setIsLoadingUsers(false);
        }
      }
    }

    loadAdminUsers();

    return () => {
      ignore = true;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) {
      return users;
    }

    return users.filter((user) => {
      return (
        user.fullName.toLowerCase().includes(normalizedSearch) ||
        user.phone.includes(normalizedSearch)
      );
    });
  }, [searchValue, users]);

  async function handleToggleUser(userId: string, checked: boolean) {
    if (updatingUserIds.has(userId)) {
      return;
    }

    const previousUsers = users;

    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, isActive: checked } : user
      )
    );

    setUpdatingUserIds((prevIds) => new Set(prevIds).add(userId));
    setUsersError("");

    try {
      const updatedUser = await updateAdminStatus(userId, checked);

      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === userId ? updatedUser : user))
      );
    } catch (error) {
      setUsers(previousUsers);
      setUsersError(
        error instanceof Error
          ? error.message
          : "تغییر وضعیت ادمین انجام نشد."
      );
    } finally {
      setUpdatingUserIds((prevIds) => {
        const nextIds = new Set(prevIds);
        nextIds.delete(userId);
        return nextIds;
      });
    }
  }

  function openAdminPhoneEditor(user: AdminUser) {
    setEditingAdminPhone({
      id: user.id,
      name: user.fullName,
      isSelf: currentAdmin?.id === user.id,
    });
    setPhoneVerificationStep("phone");
    setNewAdminPhone("");
    setAdminPhoneCode("");
    setPhoneVerificationError("");
    setPhoneVerificationResultStatus("idle");
    setPhoneVerificationResultMessage("");
  }

  function resetAdminPhoneEditor() {
    setEditingAdminPhone(null);
    setPhoneVerificationStep("phone");
    setNewAdminPhone("");
    setAdminPhoneCode("");
    setPhoneVerificationError("");
    setPhoneVerificationResultStatus("idle");
    setPhoneVerificationResultMessage("");
  }

  function closeAdminPhoneEditor() {
    if (isPhoneVerificationSubmitting) {
      return;
    }

    resetAdminPhoneEditor();
  }

  async function handleRequestAdminPhoneCode() {
    if (!isValidIranMobileNumber(newAdminPhone.trim())) {
      setPhoneVerificationError("شماره موبایل معتبر نیست.");
      return;
    }

    if (!editingAdminPhone) {
      return;
    }

    setIsPhoneVerificationSubmitting(true);
    setPhoneVerificationError("");
    setPhoneVerificationResultStatus("idle");
    setPhoneVerificationResultMessage("");

    try {
      if (editingAdminPhone.isSelf) {
        await requestOwnAdminPhoneChangeCode(newAdminPhone.trim());
      }

      setAdminPhoneCode("");
      setPhoneVerificationStep("verification");
    } catch (error) {
      setPhoneVerificationError(
        error instanceof Error
          ? error.message
          : "ارسال کد تایید انجام نشد."
      );
    } finally {
      setIsPhoneVerificationSubmitting(false);
    }
  }

  async function handleVerifyAdminPhoneCode() {
    if (!/^\d{4,6}$/.test(adminPhoneCode.trim())) {
      setPhoneVerificationError("کد تایید باید بین ۴ تا ۶ رقم باشد.");
      return;
    }

    if (!editingAdminPhone) {
      return;
    }

    try {
      setIsPhoneVerificationSubmitting(true);
      setPhoneVerificationError("");
      setPhoneVerificationResultStatus("idle");
      setPhoneVerificationResultMessage("");

      const updatedUser = editingAdminPhone.isSelf
        ? await verifyOwnAdminPhoneChange(
            newAdminPhone.trim(),
            adminPhoneCode.trim()
          ).then((session) => {
            setAdminSession(session);

            return {
              id: session.admin.id,
              fullName:
                [session.admin.firstName, session.admin.lastName]
                  .filter(Boolean)
                  .join(" ")
                  .trim() ||
                session.admin.username ||
                session.admin.phone,
              phone: session.admin.phone,
              avatar: session.admin.photoUrl || "/images/avatars/user-2.webp",
              isActive: true,
            };
          })
        : await updateAdminPhone(editingAdminPhone.id, newAdminPhone.trim());

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === editingAdminPhone.id ? updatedUser : user
        )
      );

      setPhoneVerificationResultStatus("success");
      setPhoneVerificationResultMessage(
        "شماره تماس جدید با موفقیت برای این ادمین ثبت شد."
      );
    } catch (error) {
      setPhoneVerificationResultStatus("error");
      setPhoneVerificationResultMessage(
        error instanceof Error
          ? error.message
          : "ویرایش شماره تماس انجام نشد. دوباره تلاش کنید."
      );
    } finally {
      setIsPhoneVerificationSubmitting(false);
    }
  }

  return (
    <AdminPanel
      className="relative overflow-hidden"
      contentClassName="relative min-h-[calc(100vh-64px)] px-4 py-5 sm:px-7 sm:py-6"
    >
      <AdminProfileBadge className="mx-auto mb-6 md:absolute md:left-4 md:top-4 md:mx-0 md:mb-0" />

      <div className="mx-auto w-full max-w-[430px] md:pt-4">
        <SearchInput
          value={searchValue}
          onChange={setSearchValue}
          placeholder="جستجو در ادمین ها..."
          className="w-full"
        />
      </div>

      <div className="mx-auto mt-12 flex w-full max-w-[560px] flex-col gap-3">
        {isLoadingUsers && (
          <div className="rounded-3xl border border-orange-100 bg-[#FFF9F4] px-4 py-8 text-center text-sm font-bold text-gray-600">
            در حال دریافت ادمین‌ها...
          </div>
        )}

        {usersError && (
          <div className="rounded-3xl border border-red-100 bg-red-50 px-4 py-4 text-center text-sm font-bold text-red-500">
            {usersError}
          </div>
        )}

        {filteredUsers.map((user) => (
          <AdminUserRow
            key={user.id}
            user={user}
            isUpdating={updatingUserIds.has(user.id)}
            onToggle={(checked) => handleToggleUser(user.id, checked)}
            onEditPhone={() => openAdminPhoneEditor(user)}
          />
        ))}

        {!isLoadingUsers && filteredUsers.length === 0 && (
          <div className="rounded-3xl border border-orange-100 bg-[#FFF9F4] px-4 py-8 text-center text-sm font-bold text-gray-600">
            ادمینی با این مشخصات پیدا نشد.
          </div>
        )}
      </div>

      <PhoneVerificationGlassBox
        isOpen={Boolean(editingAdminPhone)}
        step={phoneVerificationStep}
        title="ویرایش شماره تماس"
        description={
          editingAdminPhone
            ? `شماره تماس جدید ${editingAdminPhone.name} را وارد کنید و سپس کد تایید را بزنید.`
            : "شماره تماس جدید را وارد کنید و سپس کد تایید را بزنید."
        }
        phone={newAdminPhone}
        code={adminPhoneCode}
        isSubmitting={isPhoneVerificationSubmitting}
        errorMessage={phoneVerificationError}
        resultStatus={phoneVerificationResultStatus}
        resultMessage={phoneVerificationResultMessage}
        resultAutoCloseMs={3500}
        requestCodeText="دریافت کد تایید"
        verifyCodeText="ثبت شماره جدید"
        onPhoneChange={setNewAdminPhone}
        onCodeChange={setAdminPhoneCode}
        onRequestCode={handleRequestAdminPhoneCode}
        onVerifyCode={handleVerifyAdminPhoneCode}
        onBackToPhone={() => {
          setPhoneVerificationStep("phone");
          setAdminPhoneCode("");
          setPhoneVerificationError("");
          setPhoneVerificationResultStatus("idle");
          setPhoneVerificationResultMessage("");
        }}
        onClose={closeAdminPhoneEditor}
      />
    </AdminPanel>
  );
}

type AdminUserRowProps = {
  user: AdminUser;
  isUpdating: boolean;
  onToggle: (checked: boolean) => void;
  onEditPhone: () => void;
};

function AdminUserRow({
  user,
  isUpdating,
  onToggle,
  onEditPhone,
}: AdminUserRowProps) {
  return (
    <div
      dir="ltr"
      className="grid grid-cols-[54px_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[62px_minmax(0,1fr)]"
    >
      <div className="flex justify-center">
        <AdminToggle
          checked={user.isActive}
          onChange={(checked) => {
            if (!isUpdating) {
              onToggle(checked);
            }
          }}
          className={isUpdating ? "cursor-wait opacity-60" : ""}
        />
      </div>

      <article
        dir="rtl"
        className="flex h-[58px] items-center justify-between rounded-xl border border-gray-200 bg-white px-3 shadow-sm"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-[#F2CDB5]">
            <Image
              src={user.avatar}
              alt={user.fullName}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>

          <h2 className="truncate text-sm font-medium text-gray-950 sm:text-[15px]">
            {user.fullName}
          </h2>
        </div>

        <button
          type="button"
          title="ویرایش شماره تماس"
          aria-label={`ویرایش شماره تماس ${user.fullName}`}
          className="flex h-11 w-11 items-center justify-center rounded-2xl text-[#F26A2E] transition hover:bg-orange-50"
          onClick={onEditPhone}
        >
          <span className="relative flex h-6 w-6 items-center justify-center">
            <Phone size={22} strokeWidth={2.4} />
            <PencilLine
              size={13}
              strokeWidth={2.7}
              className="absolute -bottom-1 -right-1 rounded-full bg-white text-[#F26A2E]"
            />
          </span>
        </button>
      </article>
    </div>
  );
}
