// src/features/food-details/components/FoodComments.tsx

import Image from "next/image";
import { Star } from "lucide-react";

interface Comment {
  id: number;
  userName: string;
  avatar: string;
  rating: number;
  text: string;
  createdAt: string;
}

interface FoodCommentsProps {
  comments: Comment[];
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const starNumber = index + 1;
        const isFilled = starNumber <= rating;

        return (
          <Star
            key={starNumber}
            size={18}
            className="text-yellow-400"
            fill={isFilled ? "currentColor" : "none"}
            strokeWidth={1.8}
          />
        );
      })}
    </div>
  );
}

export default function FoodComments({ comments }: FoodCommentsProps) {
  if (comments.length === 0) {
    return (
      <section dir="rtl" className="space-y-4">
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">نظر کاربران</h2>
          <p className="mt-2 text-sm text-gray-500">
            هنوز نظری برای این غذا ثبت نشده است.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section dir="rtl" className="space-y-5">
      <div className="mb-2">
        <h2 className="text-xl font-bold text-gray-900">نظر کاربران</h2>
        <p className="mt-1 text-sm text-gray-500">
          تجربه بقیه افراد از این غذا
        </p>
      </div>

      <div className="space-y-5">
        {comments.map((comment) => (
          <article
            key={comment.id}
            className="rounded-3xl bg-white px-5 py-5 shadow-sm md:px-8 md:py-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-[#FDF7F2] md:h-16 md:w-16">
                  <Image
                    src={comment.avatar}
                    alt={comment.userName}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="pt-1">
                  <h3 className="text-base font-bold text-gray-900 md:text-lg">
                    {comment.userName}
                  </h3>

                  <div className="mt-2">
                    <RatingStars rating={comment.rating} />
                  </div>
                </div>
              </div>

              <span className="pt-2 text-xs text-gray-500 md:text-sm">
                {comment.createdAt}
              </span>
            </div>

            <div className="my-5 border-t border-gray-300" />

            <p className="text-right text-sm leading-8 text-gray-700 md:text-base md:leading-9">
              {comment.text}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}