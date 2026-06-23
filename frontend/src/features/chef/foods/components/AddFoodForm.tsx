// src/features/chef/foods/components/AddFoodForm.tsx

"use client";

import { ChangeEvent, FormEvent, ReactNode, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImagePlus, Upload } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useFoodStore } from "@/store/food-store";

type AddFoodFormState = {
  title: string;
  category: string;
  remaining: string;
  price: string;
  ingredients: string;
  description: string;
  image: string;
};

const categories = [
  "خورشت",
  "دسر",
  "چاشنی",
  "غذاهای محلی",
  "غذای اصلی",
  "پیش غذا",
  "کیک و شیرینی",
];

const defaultImage = "/images/food-placeholder.webp";

export default function AddFoodForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentUser = useAuthStore((state) => state.currentUser);
  const addFood = useFoodStore((state) => state.addFood);

  const [form, setForm] = useState<AddFoodFormState>({
    title: "",
    category: "",
    remaining: "",
    price: "",
    ingredients: "",
    description: "",
    image: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentUser || currentUser.role !== "chef") {
    return (
      <section className="rounded-3xl border border-orange-100 bg-white p-10 text-center shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">دسترسی غیرمجاز</h1>
        <p className="mt-2 text-sm text-gray-500">
          فقط آشپزها می‌توانند غذا اضافه کنند.
        </p>
      </section>
    );
  }

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setForm((prev) => ({
        ...prev,
        image: String(reader.result),
      }));
    };

    reader.readAsDataURL(file);
  };

  const normalizeRemaining = (value: string) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) return "";

    return trimmedValue.includes("باقیمانده")
      ? trimmedValue
      : `${trimmedValue} باقیمانده`;
  };

  const normalizeIngredients = (value: string) => {
    return value
      .split(/[،,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title || !form.category || !form.remaining || !form.price) {
      alert("لطفاً نام غذا، دسته‌بندی، مقدار و قیمت را وارد کنید.");
      return;
    }

    setIsSubmitting(true);

    addFood({
      title: form.title.trim(),
      category: form.category,
      remaining: normalizeRemaining(form.remaining),
      price: form.price.trim(),
      unit: "تومان",
      image: form.image || defaultImage,
      ingredients: normalizeIngredients(form.ingredients),
      description: form.description.trim(),
      chef: currentUser.name,
      chefId: currentUser.id,
      location: "تهران",
    });

    setIsSubmitting(false);
    router.push("/chef/foods");
  };

  return (
    <section dir="rtl" className="relative overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-sm">
      
      <div className="absolute inset-0 opacity-60  [background-size:76px_76px]" />

      <div className="relative p-5 sm:p-8 lg:p-10">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="order-2 text-center lg:order-1 lg:flex-1">
            <h1 className="text-2xl font-bold text-gray-950 sm:text-3xl">
              امروز چه غذای خوشمزه‌ای درست میکنی؟
            </h1>
          </div>

          <div className="order-1 flex w-fit items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 shadow-[0_0_0_2px_rgba(17,24,39,0.08)] backdrop-blur lg:order-2">
            <div className="relative h-14 w-14 overflow-hidden rounded-full bg-[#F2CDB5]">
              <Image
                src="/images/chef-avatar.webp"
                alt={currentUser.name}
                fill
                className="object-cover"
              />
            </div>

            <p className="text-lg font-bold text-gray-900">{currentUser.name}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mx-auto max-w-5xl">
          <div className="grid gap-x-24 gap-y-6 lg:grid-cols-2">
            <div className="space-y-6">
              <FormField label="نام غذا">
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="مثلا: قورمه سبزی"
                  className="h-14 w-full rounded-xl border border-transparent bg-[#F2CDB5]/55 px-4 text-right text-sm text-gray-800 outline-none transition placeholder:text-gray-500 focus:border-[#D48B8B] focus:bg-[#F2CDB5]/70"
                />
              </FormField>

              <FormField label="مقدار">
                <input
                  name="remaining"
                  value={form.remaining}
                  onChange={handleChange}
                  placeholder="مثلا: یک کیلو"
                  className="h-14 w-full rounded-xl border border-transparent bg-[#F2CDB5]/55 px-4 text-right text-sm text-gray-800 outline-none transition placeholder:text-gray-500 focus:border-[#D48B8B] focus:bg-[#F2CDB5]/70"
                />
              </FormField>

              <FormField label="مواد اولیه">
                <input
                  name="ingredients"
                  value={form.ingredients}
                  onChange={handleChange}
                  placeholder="مثلا: گوشت، رب انار، گردو..."
                  className="h-14 w-full rounded-xl border border-transparent bg-[#F2CDB5]/55 px-4 text-right text-sm text-gray-800 outline-none transition placeholder:text-gray-500 focus:border-[#D48B8B] focus:bg-[#F2CDB5]/70"
                />
              </FormField>
            </div>

            <div className="space-y-6">
              <FormField label="دسته بندی">
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="h-14 w-full rounded-xl border border-transparent bg-[#F2CDB5]/55 px-4 text-right text-sm text-gray-800 outline-none transition focus:border-[#D48B8B] focus:bg-[#F2CDB5]/70"
                >
                  <option value="">انتخاب کنید</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="قیمت (تومان)">
                <input
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="مثلا: 350000"
                  inputMode="numeric"
                  className="h-14 w-full rounded-xl border border-transparent bg-[#F2CDB5]/55 px-4 text-right text-sm text-gray-800 outline-none transition placeholder:text-gray-500 focus:border-[#D48B8B] focus:bg-[#F2CDB5]/70"
                />
              </FormField>
            </div>

            <div className="lg:col-span-2">
              <FormField label="توضیحات اضافه">
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="درباره غذا اگر نکته‌ای هست که مشتری باید بداند بنویسید"
                  className="w-full resize-none rounded-xl border border-transparent bg-[#F2CDB5]/55 px-4 py-4 text-right text-sm leading-8 text-gray-800 outline-none transition placeholder:text-gray-500 focus:border-[#D48B8B] focus:bg-[#F2CDB5]/70"
                />
              </FormField>
            </div>

            <div className="lg:col-span-2">
              <FormField label="عکس غذا">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="group flex min-h-[150px] w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dotted border-gray-800 bg-[#F2CDB5]/35 px-4 text-center transition hover:bg-[#F2CDB5]/50"
                >
                  {form.image ? (
                    <div className="relative h-36 w-full overflow-hidden rounded-xl">
                      <img
                        src={form.image}
                        alt="پیش نمایش غذا"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <>
                      <p className="text-base font-medium text-gray-900">
                        برای آپلود عکس اینجا کلیک کنید
                      </p>
                      <Upload
                        size={34}
                        strokeWidth={1.8}
                        className="text-gray-900 transition group-hover:-translate-y-1"
                      />
                    </>
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </FormField>
            </div>
          </div>

          <div className="mt-9 flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full max-w-xs rounded-xl bg-[#EFC5A8] text-base font-bold text-gray-900 transition hover:bg-[#e9b892] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "در حال ثبت..." : "ثبت"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-right text-lg font-bold text-gray-900">
        {label}
      </span>

      {children}
    </label>
  );
}