import Image from "next/image";
import Link from "next/link";
import { foodCategories } from "../constants/food-categories";

export default function CategorySection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-12" dir="rtl">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10">
        {foodCategories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="relative w-full aspect-square overflow-hidden rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-105">
              <Image
                src={category.image}
                alt={category.title}
                fill
                className="object-cover"
              />
            </div>

            <h3 className="mt-4 text-gray-800 font-medium text-lg md:text-xl transition-colors group-hover:text-orange-700">
              {category.title}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
}