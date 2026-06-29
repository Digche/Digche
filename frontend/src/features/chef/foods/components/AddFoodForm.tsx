// src/features/chef/foods/components/AddFoodForm.tsx

"use client";

import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import FormField from "./FormField";
import { useCreateChefFood } from "../../hooks/use-create-chef-food";

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

const inputClassName =
  "h-10 w-full rounded-lg border border-transparent bg-[#F2CDB5]/55 px-3 text-right text-xs text-gray-800 outline-none transition placeholder:text-gray-500 focus:border-[#D48B8B] focus:bg-[#F2CDB5]/70";

export default function AddFoodForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentUser = useAuthStore((state) => state.currentUser);
  const createFood = useCreateChefFood();

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
      <section className="flex h-full items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">دسترسی غیرمجاز</h1>

          <p className="mt-2 text-sm text-gray-500">
            فقط آشپزها می‌توانند غذا اضافه کنند.
          </p>
        </div>
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title || !form.category || !form.remaining || !form.price) {
      alert("لطفاً نام غذا، دسته‌بندی، مقدار و قیمت را وارد کنید.");
      return;
    }

    setIsSubmitting(true);

    createFood.mutate(
      {
        title: form.title.trim(),
        category: form.category,
        remaining: normalizeRemaining(form.remaining),
        price: form.price.trim(),
        unit: "تومان",
        image: form.image || defaultImage,
        ingredients: form.ingredients.trim(),
        description: form.description.trim(),
        location: "تهران",
      },
      {
        onSuccess: () => {
          setIsSubmitting(false);
          router.push("/chef/foods");
        },
        onError: (error) => {
          setIsSubmitting(false);
          alert(error instanceof Error ? error.message : "ثبت غذا ناموفق بود.");
        },
      }
    );
  };

  return (
    <section dir="rtl" className="relative h-full overflow-hidden">
      <div className="flex h-full flex-col px-8 py-5 lg:px-12">
          <div className="mb-5 shrink-0 text-right">
            <h1 className="text-xl py-5 font-extrabold text-gray-950">
              امروز چه غذای خوشمزه‌ای درست میکنی؟
            </h1>
          </div>
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex h-full w-full max-w-[770px] flex-col"
        >


          <div className="grid shrink-0 gap-x-18 gap-y-4 lg:grid-cols-2">
            <div className="space-y-4">
              <FormField label="نام غذا">
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="مثلا: قورمه سبزی"
                  className={inputClassName}
                />
              </FormField>

              <FormField label="دسته بندی">
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={inputClassName}
                >
                  <option value="">انتخاب کنید</option>

                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="مواد اولیه">
                <input
                  name="ingredients"
                  value={form.ingredients}
                  onChange={handleChange}
                  placeholder="مثلا: گوشت، رب انار، گردو..."
                  className={inputClassName}
                />
              </FormField>
            </div>

            <div className="h-full">
              <FormField label="عکس غذا">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="group flex h-[210px] w-[260px] mx-auto  flex-col items-center justify-center gap-2 rounded-lg border-2 border-dotted border-gray-800 bg-[#F2CDB5]/25 px-4 text-center transition hover:bg-[#F2CDB5]/40"
                >
                  {form.image ? (
                    <div className="relative  h-[96px] w-[96px] overflow-hidden rounded-lg">
                      <img
                        src={form.image}
                        alt="پیش نمایش غذا"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-gray-900">
                        برای آپلود عکس اینجا کلیک کنید
                      </p>

                      <Upload
                        size={26}
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

            <FormField label="مقدار">
              <input
                name="remaining"
                value={form.remaining}
                onChange={handleChange}
                placeholder="مثلا: یک کیلو"
                className={inputClassName}
              />
            </FormField>

            <FormField label="قیمت (تومان)">
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="مثلا: 350000"
                inputMode="numeric"
                className={inputClassName}
              />
            </FormField>



            <div className="lg:col-span-2">
              <FormField label="توضیحات اضافه">
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="درباره غذا اگر نکته‌ای هست که مشتری باید بداند بنویسید"
                  className="h-24 w-full resize-none rounded-lg border border-transparent bg-[#F2CDB5]/55 px-3 py-3 text-right text-xs leading-6 text-gray-800 outline-none transition placeholder:text-gray-500 focus:border-[#D48B8B] focus:bg-[#F2CDB5]/70"
                />
              </FormField>
            </div>
          </div>

          <div className="mt-7 flex shrink-0 justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-9 w-60 rounded-lg bg-[#EFC5A8] text-sm font-bold text-gray-900 transition hover:bg-[#e9b892] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "در حال ثبت..." : "ثبت"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}