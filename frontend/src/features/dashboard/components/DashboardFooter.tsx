"use client";

import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Send } from 'lucide-react';
import Image from 'next/image';

export default function DashboardFooter() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8" dir="rtl">
      <div className="container mx-auto px-4 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* ستون اول: درباره ما و لوگو */}
          <div className="space-y-6 mt-[-25]">
            <div className="flex items-end gap-0  ">
              <Image src="/icons/Logo.svg" alt="لوگو" width={80} height={80} />
              <span className="text-sm font-bold text-gray-800">طعم اصیل خانگی</span>
            </div>
            <p className="text-gray-500 text-sm leading-7 text-justify">
              تجربه لذت‌بخش سفارش آنلاین غذا با بهترین کیفیت و سریع‌ترین زمان ممکن. ما در کنار شما هستیم تا طعم‌های بی‌نظیر را به خانه‌هایتان بیاوریم.
            </p>
          </div>

          {/* ستون دوم: دسترسی سریع */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-6">دسترسی سریع</h3>
            <ul className="space-y-4">
              <li><Link href="/" className="text-gray-500 hover:text-[#C46E3F] text-sm transition-colors">صفحه اصلی</Link></li>
              <li><Link href="/foods" className="text-gray-500 hover:text-[#C46E3F] text-sm transition-colors">منوی غذاها</Link></li>
              <li><Link href="/about" className="text-gray-500 hover:text-[#C46E3F] text-sm transition-colors">درباره ما</Link></li>
              <li><Link href="/faq" className="text-gray-500 hover:text-[#C46E3F] text-sm transition-colors">سوالات متداول</Link></li>
            </ul>
          </div>

          {/* ستون سوم: تماس با ما */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-6">تماس با ما</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-gray-500 text-sm">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Phone size={16} className="text-[#C46E3F]" />
                </div>
                <span>۰۲۱-۱۲۳۴۵۶۷۸</span>
              </li>
              <li className="flex items-center gap-3 text-gray-500 text-sm">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Mail size={16} className="text-[#C46E3F]" />
                </div>
                <span>info@foodino.com</span>
              </li>
              <li className="flex items-start gap-3 text-gray-500 text-sm">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <MapPin size={16} className="text-[#C46E3F]" />
                </div>
                <span className="leading-6">تهران، خیابان ولیعصر، بالاتر از میدان ونک</span>
              </li>
            </ul>
          </div>

          {/* ستون چهارم: نمادهای الکترونیک (E-Namad) */}
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-bold text-gray-800 mb-6 w-full text-right">نمادهای اعتماد</h3>
              <div className="w-24 h-24 bg-white border border-gray-100 rounded-2xl shadow-sm p-4 ">
                    <Image
                      className="h-18 w-20 object-cover"
                      src={"/icons/Enamad.svg"}
                      alt="لوگو دیگچه"
                      width={250}
                      height={250}
                    />
              </div>
          </div>

        </div>

        {/* کپی‌رایت نهایی */}
        <div className="pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-400 text-xs">
             تمامی حقوق برای تیم دیگچه محفوظ است.© {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
};

