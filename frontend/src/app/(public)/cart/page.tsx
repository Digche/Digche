"use client";

import Image from "next/image";
import { useCartStore } from "@/store/cart-store";
import { Plus, Minus, Trash2, MapPin, ChefHat } from "lucide-react";
import CartSummary from "@/features/cart/component/CartSummery";
import PageHeader from "@/features/cart/component/CartHeader";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);

if (items.length === 0) {
  return (
    <main dir="rtl" className="min-h-screen bg-[#FFF9F4] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <PageHeader
          title="سبد خرید"
        />

        <div className="rounded-3xl border border-orange-100 bg-white p-10 text-center shadow-sm">
          <h2 className="mb-3 text-2xl font-bold text-gray-800">
            سبد خرید شما خالی است
          </h2>

          <p className="text-gray-500">
            هنوز غذایی به سبد خرید اضافه نکرده‌اید.
          </p>
        </div>
      </div>
    </main>
  );
}

  return (
    
    <main dir="rtl" className="min-h-screen  px-4 py-8">
      <div className="mx-auto max-w-6xl">
          <PageHeader
            title="سبد خرید"
          /> 
      </div>
   
        <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <p className="mt-1 mr-6 text-sm text-gray-500">
            {items.length} غذا در سبد خرید شماست
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            {items.map((item) => (
              <article
                key={item.id}
                className="flex items-center gap-3 rounded-3xl border border-orange-100 bg-[#FDF7F2] p-3 shadow-sm transition hover:shadow-md sm:gap-4 sm:p-4"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl sm:h-28 sm:w-28">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1 text-right">
                  <h2 className="truncate text-base font-bold text-gray-900 sm:text-lg">
                    {item.title}
                  </h2>

                  <div className="mt-2 flex flex-col gap-1 text-xs text-gray-500 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:text-sm">
                    <span className="flex items-center gap-1">
                      <ChefHat size={14} className="shrink-0 text-[#D48B8B]" />
                      <span className="truncate">{item.chef}</span>
                    </span>

                    <span className="flex items-center gap-1">
                      <MapPin size={14} className="shrink-0 text-orange-400" />
                      <span className="truncate">{item.location}</span>
                    </span>
                  </div>

                  <div className="mt-3 flex w-fit items-center gap-1 rounded-full border border-gray-200 bg-white p-1 shadow-sm sm:gap-2">

                    <button
                      type="button"
                      onClick={() => increaseQuantity(item.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-[#D48B8B] text-white transition hover:bg-[#c97b7b] sm:h-8 sm:w-8"
                      aria-label="زیاد کردن تعداد"
                    >
                      <Plus size={15} />
                    </button>

                    <span className="min-w-6 text-center text-xs font-bold text-gray-800 sm:min-w-8 sm:text-sm">
                      {item.quantity}
                    </span>


                    <button
                      type="button"
                      onClick={() => decreaseQuantity(item.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FDF7F2] text-gray-700 transition hover:bg-gray-100 sm:h-8 sm:w-8"
                      aria-label="کم کردن تعداد"
                    >
                      <Minus size={15} />
                    </button>

                  </div>
                </div>

                <div className="flex min-w-[72px] shrink-0 flex-col items-end gap-4 self-stretch border-r border-orange-100 pr-3 sm:min-w-32 sm:gap-5 sm:pr-4">
                  <div className="text-right">
                    <p className="text-[11px] text-gray-400 sm:text-xs">قیمت</p>

                    <p className="text-sm font-bold text-gray-900 sm:text-lg">
                      {item.unit && (
                        <span className="ml-1 text-xs font-normal text-gray-500 sm:text-sm">
                          {item.unit}
                        </span>
                      )}
                      {item.price}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="mt-auto flex items-center gap-1 rounded-full text-xs font-medium text-red-500 transition hover:bg-red-50 sm:px-3 sm:py-2 sm:text-sm"
                  >
                    <Trash2 size={15} />
                    <span className="hidden sm:inline">حذف</span>
                  </button>
                </div>
              </article>
            ))}
          </div>

          <CartSummary />
        </div>
      </div>
    </main>
  );
}