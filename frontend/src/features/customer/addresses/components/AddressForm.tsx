"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import ProvinceCityDropdown, {
  type ProvinceCityValue,
} from "@/shared/location/ProvinceCityDropdown";
import type { CustomerAddressPayload } from "../types/customer-address.types";

type AddressFormProps = {
  onSubmit: (payload: CustomerAddressPayload) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
};

type AddressFormState = {
  title: string;
  province: string;
  city: string;
  details: string;
};

export default function AddressForm({
  onSubmit,
  isSubmitting = false,
  onCancel,
}: AddressFormProps) {
  const [form, setForm] = useState<AddressFormState>({
    title: "",
    province: "",
    city: "",
    details: "",
  });

  const selectedProvinceCity = useMemo<ProvinceCityValue>(
    () => ({
      province: form.province,
      city: form.city,
    }),
    [form.province, form.city]
  );

  const isProvinceCitySelected = Boolean(form.province && form.city);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProvinceCityChange = (value: ProvinceCityValue) => {
    setForm((prev) => ({
      ...prev,
      province: value.province,
      city: value.city,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = form.title.trim();
    const province = form.province.trim();
    const city = form.city.trim();
    const details = form.details.trim();

    if (!title) {
      alert("لطفاً عنوان آدرس را وارد کنید.");
      return;
    }

    if (!province || !city) {
      alert("لطفاً استان و شهر را انتخاب کنید.");
      return;
    }

    if (!details) {
      alert("لطفاً جزئیات آدرس را وارد کنید.");
      return;
    }

    const addressLine = [province, city, details].join("، ");

    onSubmit({
      title,
      province,
      city,
      details,
      addressLine,
    });

    setForm({
      title: "",
      province: "",
      city: "",
      details: "",
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-orange-100 bg-[#FFF9F4] p-4"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-right text-sm font-bold text-gray-900">
            عنوان آدرس
          </span>

          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="مثلاً خانه، محل کار، دانشگاه"
            className="h-11 w-full rounded-xl border border-transparent bg-[#F2CDB5]/55 px-4 text-right text-sm text-gray-800 outline-none transition placeholder:text-gray-500 focus:border-[#D48B8B] focus:bg-[#F2CDB5]/70"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-right text-sm font-bold text-gray-900">
            استان و شهر
          </span>

          <ProvinceCityDropdown
            value={selectedProvinceCity}
            onChange={handleProvinceCityChange}
            placeholder="اول استان و شهر را انتخاب کنید"
          />
        </label>

        <label className="block lg:col-span-2">
          <span className="mb-2 block text-right text-sm font-bold text-gray-900">
            جزئیات آدرس
          </span>

          <textarea
            name="details"
            value={form.details}
            onChange={handleChange}
            disabled={!isProvinceCitySelected}
            rows={3}
            placeholder={
              isProvinceCitySelected
                ? "مثلاً خیابان، کوچه، پلاک، واحد..."
                : "ابتدا استان و شهر را انتخاب کنید"
            }
            className="w-full resize-none rounded-xl border border-transparent bg-[#F2CDB5]/55 px-4 py-3 text-right text-sm leading-7 text-gray-800 outline-none transition placeholder:text-gray-500 focus:border-[#D48B8B] focus:bg-[#F2CDB5]/70 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </label>
      </div>

      <div className="mt-4 flex justify-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-10 w-36 rounded-xl bg-[#EFC5A8] text-sm font-bold text-gray-900 transition hover:bg-[#e9b892] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "در حال ثبت..." : "ثبت آدرس"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="h-10 w-28 rounded-xl bg-gray-100 text-sm font-bold text-gray-700 transition hover:bg-gray-200"
          >
            انصراف
          </button>
        )}
      </div>
    </form>
  );
}