import CategoryFoodsScreen from "@/features/categories/components/CategoryFoodsScreen";

type CategoryPageProps = {
  params: Promise<{
    categorySlug: string;
  }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categorySlug } = await params;

  return <CategoryFoodsScreen categorySlug={categorySlug} />;
}