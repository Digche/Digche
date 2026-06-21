"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, MapPin, ChevronLeft } from 'lucide-react';

const iranData = [
  { name: 'تهران', cities: ['تهران', 'ورامین', 'اسلامشهر', 'ری'] },
  { name: 'خراسان رضوی', cities: ['مشهد', 'نیشابور', 'سبزوار', 'قوچان'] },
  { name: 'اصفهان', cities: ['اصفهان', 'کاشان', 'خمینی‌شهر', 'نجف‌آباد'] },
  { name: 'فارس', cities: ['شیراز', 'مرودشت', 'جهرم', 'کازرون'] },
];

const ProvinceCityDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('انتخاب محل سکونت');
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHoveredProvince(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCitySelect = (province: string, city: string) => {
    setSelectedLocation(`${province}، ${city}`);
    setIsOpen(false);
    setHoveredProvince(null);
  };

  return (
    <div
      className="relative w-full flex justify-center"
      dir="rtl"
      ref={dropdownRef}
    >

      {/* دکمه */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-3 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-all min-w-[200px]"
      >
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-orange-500" />
          <span className="text-gray-700 font-medium">{selectedLocation}</span>
        </div>

        <ChevronDown
          size={18}
          className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* dropdown استان‌ها */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl z-50">

          <div className="py-2">
            {iranData.map((province) => (
              <div
                key={province.name}
                onMouseEnter={() => setHoveredProvince(province.name)}
                className="relative"
              >

                <div
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
                    hoveredProvince === province.name
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-sm font-medium">{province.name}</span>
                  <ChevronLeft size={14} className="opacity-50" />
                </div>

                {/* شهرها */}
                {hoveredProvince === province.name && (
                  <div
                    className="absolute top-0 right-full mr-1 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-[60]"
                    onMouseLeave={() => setHoveredProvince(null)}
                  >
                    <div className="py-2">
                      {province.cities.map((city) => (
                        <div
                          key={city}
                          onClick={() => handleCitySelect(province.name, city)}
                          className="px-5 py-3 text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-600 cursor-pointer transition-colors"
                        >
                          {city}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
};

export default ProvinceCityDropdown;
