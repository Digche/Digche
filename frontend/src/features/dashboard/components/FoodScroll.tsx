import React from 'react';
import Image from 'next/image';
import { MapPin, ChevronLeft } from 'lucide-react'; // Star دیگر لازم نیست چون داخل FoodCard است
import FoodCard from './FoodCard'; // کامپوننت جدید را Import کنید
import Link from 'next/link';

const foodItems = [
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
];
const FoodScroll = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 py-12 rtl" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">اطراف شما</h2>

        <Link
        href="/locals"
        className="flex items-center text-orange-600 font-medium hover:underline cursor-pointer">
                 غذاهای بیشتر
          <ChevronLeft size={18} className="mr-1" />
        </Link>
      </div>

      <div className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide snap-x snap-mandatory">
        {foodItems.map((item) => (
          <FoodCard key={item.id} item={item} /> // استفاده از کامپوننت FoodCard
        ))}
      </div>
    </section>
  );
};

export default FoodScroll;
