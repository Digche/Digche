import React from 'react';
import { ShoppingCart, User, ChevronDown } from 'lucide-react';
import Image from 'next/image';

export default function DashboardHeader()
{
  return (
    <header className="w-[90%] mx-auto bg-white  py-3 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* بخش سمت راست: لوگو و شعار */}
        <div className="flex flex-col  ">
          <div className="flex items-center gap-2">
            <Image
              className="h-18 w-20 object-cover"
              src={"/icons/Logo.svg"}
              alt="لوگو دیگچه"
              width={250}
              height={250}
            />

          </div>
          <p className="text-[13px] text-black mt-[-10] mr-16 font-medium">
            طعم اصیل خانگی...!
          </p>
        </div>

        {/* بخش سمت چپ: سبد خرید و پروفایل */}
        <div className="flex items-center gap-4">

            {/* پروفایل کاربر */}
          <div className="flex items-center gap-1 cursor-pointer group">
            <User size={26} strokeWidth={1.5} className="text-gray-700 group-hover:text-orange-600" />
            <ChevronDown size={16} className="text-gray-500 group-hover:text-orange-600" />

          </div>

          {/* جداکننده عمودی */}
          <div className="h-6 w-[1px] bg-gray-300"></div>
          
          {/* آیکون سبد خرید */}
          <button className="text-gray-700 hover:text-orange-600 transition-colors">
            <ShoppingCart size={26} strokeWidth={1.5} />
          </button>
          
        </div>


      </div>

      <div className="w-full h-[1px] mt-2.5 bg-gray-800"></div>

    </header>
  );
};

