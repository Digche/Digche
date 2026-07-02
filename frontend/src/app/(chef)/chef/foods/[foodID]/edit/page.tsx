// src/app/(chef)/chef/foods/[foodID]/edit/page.tsx


import EditFoodForm from "@/features/chef/components/EditFoodForm";
import PageHeader from "@/shared/components/SharedHeader";

type EditFoodPageProps = {
  params: Promise<{
    foodID: string;
  }>;
};

export default async function EditFoodPage({ params }: EditFoodPageProps) {
  const { foodID } = await params;

  return (
    <main dir="rtl" className="">

        <EditFoodForm foodID={foodID} />
    </main>
  );
}