// src/features/chef-food/components/EditFoodForm.tsx

"use client";

import { ChangeEvent, FormEvent, ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Save, ImageIcon } from "lucide-react";
import { useFoodStore } from "@/store/food-store";
import { useAuthStore } from "@/store/auth-store";

type EditFoodFormProps = {
  foodID: string;
};

type FoodFormState = {
  title: string;
  category: string;
  price: string;
  remaining: string;
  location: string;
  image: string;
  description: string;
  ingredients: string;
};

const categories = [
  "صبحانه",
  "دسر",
  "غذای کبابی",
  "خورشت",
  "چاشنی",
  "کوکو و کتلت",
  "غذا های رژیمی",
  "غذا های ملاقه ای",
  "کیک و شیرینی",
  "ماکارونی و پاستا",
];


export default function EditFoodForm({ foodID }: EditFoodFormProps) {
  const router = useRouter();

  const currentUser = useAuthStore((state) => state.currentUser);

  const food = useFoodStore((state) =>
    state.foods.find((food) => food.id === Number(foodID))
  );

  const updateFood = useFoodStore((state) => state.updateFood);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<FoodFormState>({
    title: "",
    category: "",
    price: "",
    remaining: "",
    location: "",
    image: "",
    description: "",
    ingredients: "",
  });

  useEffect(() => {
    if (!food) return;

    setForm({
      title: food.title,
      category: food.category,
      price: food.price,
      remaining: food.remaining,
      location: food.location,
      image: food.image,
      description: food.description ?? "",
      ingredients: food.ingredients ?? "",    });
  }, [food]);

  if (!food) {
    return (
      <div className="rounded-3xl border border-orange-100 bg-white p-10 text-center shadow-sm">
        <h2 className="text-xl font-bold text-gray-800">غذا پیدا نشد</h2>

        <p className="mt-2 text-sm text-gray-500">
          غذای مورد نظر وجود ندارد یا حذف شده است.
        </p>

        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-6 rounded-full bg-[#D48B8B] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#c97b7b]"
        >
          بازگشت
        </button>
      </div>
    );
  }

  const canEditFood =
    currentUser?.role === "chef" && Number(food.chefId) === Number(currentUser.id);

  if (!canEditFood) {
    return (
      <div className="rounded-3xl border border-orange-100 bg-white p-10 text-center shadow-sm">
        <h2 className="text-xl font-bold text-gray-800">دسترسی غیرمجاز</h2>

        <p className="mt-2 text-sm text-gray-500">
          شما اجازه ویرایش این غذا را ندارید.
        </p>

        <button
          type="button"
          onClick={() => router.push(`/foods/${foodID}`)}
          className="mt-6 rounded-full bg-[#D48B8B] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#c97b7b]"
        >
          بازگشت به صفحه غذا
        </button>
      </div>
    );
  }

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);

    updateFood(food.id, {
      title: form.title.trim(),
      category: form.category,
      price: form.price.trim(),
      remaining: form.remaining.trim(),
      location: form.location.trim(),
      image: form.image,
      description: form.description.trim(),
      ingredients: form.ingredients.trim(),    });

    setIsSubmitting(false);

    router.push(`/foods/${food.id}`);
  };

  const isBase64Image = form.image.startsWith("data:");

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-orange-100 bg-white p-4 shadow-sm sm:p-6"
      dir="rtl"
    >
      <div className="grid gap-6 md:grid-cols-[1fr_280px]">
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="نام غذا">
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-200 bg-[#FFF9F4] px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#D48B8B]"
              />
            </FormField>

            <FormField label="دسته‌بندی">
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-200 bg-[#FFF9F4] px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#D48B8B]"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="قیمت">
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="۳۰۰,۰۰۰"
                className="w-full rounded-2xl border border-gray-200 bg-[#FFF9F4] px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#D48B8B]"
              />
            </FormField>

            <FormField label="موجودی">
              <input
                name="remaining"
                value={form.remaining}
                onChange={handleChange}
                placeholder="۲ پرس باقیمانده"
                className="w-full rounded-2xl border border-gray-200 bg-[#FFF9F4] px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#D48B8B]"
              />
            </FormField>
          </div>

          <FormField label="موقعیت">
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="تهران"
              className="w-full rounded-2xl border border-gray-200 bg-[#FFF9F4] px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#D48B8B]"
            />
          </FormField>

          <FormField label="مواد اولیه">
            <textarea
              name="ingredients"
              value={form.ingredients}
              onChange={handleChange}
              rows={3}
              placeholder="مثلا: گوشت، رب انار، گردو"
              className="w-full resize-none rounded-2xl border border-gray-200 bg-[#FFF9F4] px-4 py-3 text-sm leading-7 text-gray-800 outline-none transition focus:border-[#D48B8B]"
            />
          </FormField>
        </div>

        <div className="space-y-4">
          <div className="relative h-64 overflow-hidden rounded-3xl border border-orange-100 bg-[#FDF7F2] md:h-72">
            {form.image ? (
              <Image
                src={form.image}
                alt={form.title || "تصویر غذا"}
                fill
                className="object-cover"
                unoptimized={isBase64Image}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                <ImageIcon size={40} />
              </div>
            )}
          </div>

          <FormField label="آدرس تصویر غذا">
            <input
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="/images/foods/example.jpg"
              className="w-full rounded-2xl border border-gray-200 bg-[#FFF9F4] px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#D48B8B]"
            />
          </FormField>
        </div>
      </div>

      <div className="mt-6">
        <FormField label="توضیحات غذا">
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={6}
            className="w-full resize-none rounded-2xl border border-gray-200 bg-[#FFF9F4] px-4 py-3 text-sm leading-7 text-gray-800 outline-none transition focus:border-[#D48B8B]"
          />
        </FormField>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-orange-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full bg-[#FDF7F2] px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-orange-100"
        >
          انصراف
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 rounded-full bg-[#D48B8B] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#c97b7b] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={18} />
          {isSubmitting ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </button>
      </div>
    </form>
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
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      {children}
    </div>
  );
}