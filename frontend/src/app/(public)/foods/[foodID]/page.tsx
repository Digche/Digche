// src/app/(public)/foods/[foodID]/page.tsx

import SharedHeader from "@/shared/components/SharedHeader";
import FoodDetailsClient from "@/features/foods/components/FoodDetailsClient";

type FoodDetailsPageProps = {
  params: Promise<{
    foodID: string;
  }>;
};

export default async function FoodDetailsPage({
  params,
}: FoodDetailsPageProps) {
  const { foodID } = await params;

  return (
    <main dir="rtl" className="min-h-screen bg-[#FFF9F4] px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <SharedHeader title="اطلاعات بیشتر" />
      </div>

      <div className="mx-auto max-w-6xl space-y-8">
        <FoodDetailsClient foodID={foodID} />
      </div>
    </main>
  );
}