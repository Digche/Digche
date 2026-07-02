"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadDishImage } from "@/features/media/api/media-upload.api";
import { useAuthStore } from "@/store/auth-store";
import { useChefFoodDetail } from "../hooks/use-chef-food-detail";
import { useUpdateChefFood } from "../hooks/use-update-chef-food";
import ChefFoodForm, {
  type ChefFoodFormValues,
} from "@/features/chef/foods/components/ChefFoodForm";

type EditFoodFormProps = {
  foodID: string;
};

export default function EditFoodForm({ foodID }: EditFoodFormProps) {
  const router = useRouter();

  const currentUser = useAuthStore((state) => state.currentUser);

  const { data: food, isLoading, isError } = useChefFoodDetail(foodID);
  const updateFood = useUpdateChefFood();

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <section className="flex h-full items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-gray-800">
          در حال دریافت اطلاعات غذا...
        </h2>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="flex h-full items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            دریافت اطلاعات غذا ناموفق بود
          </h2>

          <p className="mt-2 text-sm text-red-500">
            لطفاً دوباره تلاش کنید.
          </p>

          <button
            type="button"
            onClick={() => router.back()}
            className="mt-6 rounded-full bg-[#D48B8B] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#c97b7b]"
          >
            بازگشت
          </button>
        </div>
      </section>
    );
  }

  if (!food) {
    return (
      <section className="flex h-full items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">غذا پیدا نشد</h2>

          <p className="mt-2 text-sm text-gray-500">
            غذای مورد نظر وجود ندارد یا حذف شده است.
          </p>

          <button
            type="button"
            onClick={() => router.push("/chef/foods")}
            className="mt-6 rounded-full bg-[#D48B8B] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#c97b7b]"
          >
            بازگشت
          </button>
        </div>
      </section>
    );
  }

  const canEditFood =
    currentUser?.role === "chef" &&
    String(food.chefId) === String(currentUser.publicId ?? currentUser.id);

  if (!canEditFood) {
    return (
      <section className="flex h-full items-center justify-center p-6 text-center">
        <div>
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
      </section>
    );
  }

  const initialValues: ChefFoodFormValues = {
    title: food.title,
    category: food.category,
    remaining: food.remaining,
    price: food.price,
    ingredients: food.ingredients ?? "",
    description: food.description ?? "",
    image: food.image,
  };

  const handleUpdateFood = async (
    values: ChefFoodFormValues,
    imageFile: File | null
  ) => {
    setIsSubmitting(true);

    try {
      const uploadedImageUrl = imageFile
        ? await uploadDishImage(imageFile, food.id)
        : values.image;

      await updateFood.mutateAsync({
        foodId: food.id,
        payload: {
          title: values.title.trim(),
          category: values.category,
          price: values.price.trim(),
          remaining: values.remaining.trim(),
          image: uploadedImageUrl,
          description: values.description.trim(),
          ingredients: values.ingredients.trim(),
        },
      });

      router.push(`/foods/${food.id}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "ویرایش غذا ناموفق بود.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ChefFoodForm
      heading="غذات رو ویرایش کن"
      submitLabel="ذخیره تغییرات"
      submittingLabel="در حال ذخیره..."
      initialValues={initialValues}
      isSubmitting={isSubmitting}
      onSubmit={handleUpdateFood}
      onCancel={() => router.back()}
    />
  );
}