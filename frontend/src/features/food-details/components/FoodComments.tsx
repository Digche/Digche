// src/features/food-details/components/FoodComments.tsx

import { Star } from "lucide-react";

interface Comment {
  id: number;
  userName: string;
  rating: number;
  text: string;
  createdAt: string;
}

interface FoodCommentsProps {
  comments: Comment[];
}

export default function FoodComments({ comments }: FoodCommentsProps) {
  return (
    <section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900">نظر کاربران</h2>
        <p className="mt-1 text-sm text-gray-500">
          تجربه بقیه افراد از این غذا
        </p>
      </div>

      <div className="space-y-4">
        {comments.map((comment) => (
          <article
            key={comment.id}
            className="rounded-2xl border border-orange-100 bg-[#FFF9F4] p-4"
          >
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-gray-900">
                  {comment.userName}
                </h3>
                <p className="mt-1 text-xs text-gray-400">
                  {comment.createdAt}
                </p>
              </div>

              <div className="flex items-center gap-1 text-yellow-500">
                <span className="text-sm font-bold text-gray-700">
                  {comment.rating}
                </span>
                <Star size={15} fill="currentColor" />
              </div>
            </div>

            <p className="leading-7 text-gray-600">{comment.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}