// app/foods.tsx (یا pages/foods.tsx)
import React from 'react';
import Image from 'next/image';
import { Star, MapPin, ChevronLeft } from 'lucide-react';
import FoodCard from '@/features/dashboard/components/FoodCard';

// برای این صفحه، لیست کامل غذاها را دوباره تعریف می‌کنیم یا از یک API می‌گیریم
const allFoodItems = [
  {
    id: 1,
    title: 'فسنجان',
    category: 'خورشت',
    rating: 3.5,
    remaining: '۲ پرس باقیمانده',
    chef: 'دستپخت خانم ایکس',
    location: 'تهران',
    price: '۳۰۰,۰۰۰ تومان',
    image: '/images/fesenjan.webp',
  },
  {
    id: 2,
    title: 'ترشی اسپانیایی',
    category: 'چاشنی',
    rating: 4.8,
    remaining: '۲ کیلو باقیمانده',
    chef: 'دستپخت خانم ایکس',
    location: 'تهران',
    price: '۸۰,۰۰۰ تومان',
    unit: 'یک کیلو',
    image: '/images/torshi.webp',
  },
  {
    id: 3,
    title: 'چیزکیک آلبالو',
    category: 'دسر',
    rating: 4.2,
    remaining: '۳ پرس باقیمانده',
    chef: 'دستپخت خانم ایکس',
    location: 'تهران',
    price: '۲۵۰,۰۰۰ تومان',
    image: '/images/cheesecake.webp',
  },
    {
    id: 4,
    title: 'ترشی اسپانیایی',
    category: 'چاشنی',
    rating: 4.8,
    remaining: '۲ کیلو باقیمانده',
    chef: 'دستپخت خانم ایکس',
    location: 'تهران',
    price: '۸۰,۰۰۰ تومان',
    unit: 'یک کیلو',
    image: '/images/torshi.webp',
  },
  {
    id: 5,
    title: 'چیزکیک آلبالو',
    category: 'دسر',
    rating: 4.2,
    remaining: '۳ پرس باقیمانده',
    chef: 'دستپخت خانم ایکس',
    location: 'تهران',
    price: '۲۵۰,۰۰۰ تومان',
    image: '/images/cheesecake.webp',
  },
  // ... تمام غذاهای دیگر
];

// می‌توانید این بخش را به گرید تبدیل کنید تا همه غذاها همزمان دیده شوند
export default function FoodListPage()
{
  return (
    <section className="max-w-7xl mx-auto px-6 py-12" dir="rtl">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
        تمام غذاهای موجود
      </h2>

      <div className="w-[90%] mx-auto h-[1px] mt-2.5 mb-5  bg-[#D9D9D9]"></div>


      {/* اینجا می‌توانید به جای اسکرول افقی، از یک گرید استفاده کنید */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-12">
        {allFoodItems.map((item) => (
          <FoodCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
};

