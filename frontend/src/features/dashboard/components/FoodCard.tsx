import React from 'react';
import Image from 'next/image';
import { Star, MapPin, ChevronLeft } from 'lucide-react';

// تعریف یک interface برای نوع داده‌های آیتم غذا
interface FoodItemProps {
  id: number;
  title: string;
  category: string;
  rating: number;
  remaining: string;
  chef: string;
  location: string;
  price: string;
  unit?: string; // اختیاری
  image: string;
}

interface FoodCardProps {
  item: FoodItemProps;
}

const FoodCard: React.FC<FoodCardProps> = ({ item }) => {
  return (
    <div className="min-w-[280px] md:min-w-[320px] bg-[#FDF7F2] rounded-3xl overflow-hidden border border-gray-100 shadow-sm snap-start">
      <div className="relative h-62 w-full">
        <Image 
          src={item.image} 
          alt={item.title} 
          fill 
          className="object-cover p-2 rounded-[2.5rem]" 
        />
        <div className="absolute top-4 left-6 bg-[#D48B8B] text-white text-xs px-6 py-1 rounded-full opacity-90">
          {item.category}
        </div>
      </div>

      <div className="p-5 text-right">
        <div className="flex justify-between items-start mb-2">
            
            <h3 className="text-xl font-bold text-gray-800">{item.title}</h3>

            <div className="flex items-center gap-1 text-yellow-500">
                <span className="text-gray-700 font-bold text-sm">{item.rating}</span>
                <Star size={14} fill="currentColor" />
            </div>

        </div>

        <div className="space-y-1 mb-6 text-gray-600 text-sm">
          <p>{item.remaining}</p>
          <p>{item.chef}</p>
          <p className="flex items-center justify-end gap-1">
            {item.location}
            <MapPin size={14} className="text-orange-400" />
          </p>
        </div>

        <div className="flex justify-start items-center border-t border-gray-200 pt-2">
          <span className="text-lg font-bold text-gray-900">
            {item.unit && <span className="text-sm font-normal ml-1">{item.unit}</span>}
            {item.price}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
