// src/app/(chef)/chef/foods/[foodID]/edit/page.tsx


import EditFoodForm from "@/features/chef-food/components/EditFoodForm";
import PageHeader from "@/shared/components/SharedHeader";

type EditFoodPageProps = {
  params: Promise<{
    foodID: string;
  }>;
};

export default async function EditFoodPage({ params }: EditFoodPageProps) {
  const { foodID } = await params;

  return (
    <main dir="rtl" className="min-h-screen bg-[#FFF9F4] px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <PageHeader
          title="ویرایش اطلاعات غذا"
          description="اطلاعات غذا را ویرایش و ذخیره کنید"
        />

        <EditFoodForm foodID={foodID} />
      </div>
    </main>
  );
}