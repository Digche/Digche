// src/features/chef-food/components/EditFoodForm.tsx

"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
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
};


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
    });
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
  currentUser?.role === "chef" && food.chefId === currentUser.id;

  if (!canEditFood) {
    return (
      <div className="rounded-3xl border border-orange-100 bg-white p-10 text-center shadow-sm">
        <h2 className="text-xl font-bold text-gray-800">
          دسترسی غیرمجاز
        </h2>

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
      title: form.title,
      category: form.category,
      price: form.price,
      remaining: form.remaining,
      location: form.location,
      image: form.image,
      description: form.description,
    });

    setIsSubmitting(false);

    router.push(`/foods/${food.id}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6 rounded-3xl border border-orange-100 bg-white p-4 shadow-sm md:grid-cols-[280px_1fr] md:p-6"
    >
      <div className="space-y-4">
        <div className="relative h-64 overflow-hidden rounded-3xl border border-orange-100 bg-[#FDF7F2]">
          {form.image ? (
            <Image
              src={form.image}
              alt={form.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              <ImageIcon size={40} />
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            آدرس تصویر غذا
          </label>

          <input
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder="/images/foods/example.jpg"
            className="w-full rounded-2xl border border-gray-200 bg-[#FFF9F4] px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#D48B8B]"
          />
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              نام غذا
            </label>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full rounded-2xl border border-gray-200 bg-[#FFF9F4] px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#D48B8B]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              دسته‌بندی
            </label>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full rounded-2xl border border-gray-200 bg-[#FFF9F4] px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#D48B8B]"
            >
              <option value="غذای ایرانی">غذای ایرانی</option>
              <option value="خورشت">خورشت</option>
              <option value="چاشنی">چاشنی</option>
              <option value="دسر">دسر</option>
              <option value="فست فود">فست فود</option>
              <option value="گیاهی">گیاهی</option>
              <option value="نوشیدنی">نوشیدنی</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              قیمت
            </label>

            <input
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="۳۰۰,۰۰۰"
              className="w-full rounded-2xl border border-gray-200 bg-[#FFF9F4] px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#D48B8B]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              موجودی
            </label>

            <input
              name="remaining"
              value={form.remaining}
              onChange={handleChange}
              placeholder="۲ پرس باقیمانده"
              className="w-full rounded-2xl border border-gray-200 bg-[#FFF9F4] px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#D48B8B]"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            موقعیت
          </label>

          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="تهران"
            className="w-full rounded-2xl border border-gray-200 bg-[#FFF9F4] px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#D48B8B]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            توضیحات غذا
          </label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={5}
            className="w-full resize-none rounded-2xl border border-gray-200 bg-[#FFF9F4] px-4 py-3 text-sm leading-7 text-gray-800 outline-none transition focus:border-[#D48B8B]"
          />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-orange-100 pt-5">
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
            className="flex items-center gap-2 rounded-full bg-[#D48B8B] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#c97b7b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={18} />
            {isSubmitting ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </button>
        </div>
      </div>
    </form>
  );
}