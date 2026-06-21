"use client";

import React, { useState } from 'react';
import { Search } from 'lucide-react';

const SearchBox = () => {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", query);
    // اینجا منطق جستجو را اضافه کنید
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4" dir="rtl">
      <form 
        onSubmit={handleSearch}
        className="relative group flex items-center"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="جست و جوی غذا ..."
          className="w-full py-3 px-12 text-sm text-gray-700 bg-white border-2 border-gray-200 rounded-xl outline-none transition-all duration-300 
                     placeholder:text-gray-400
                     group-hover:border-[#C46E3F] focus:border-[#C46E3F]"
        />
        
        {/* آیکون سرچ در سمت راست */}
        <div className="absolute right-4 text-gray-400 group-hover:text-[#C46E3F] transition-colors">
          <Search size={20} />
        </div>

        {/* دکمه مخفی برای سابمیت شدن با Enter */}
        <button type="submit" className="hidden">جستجو</button>
      </form>
    </div>
  );
};

export default SearchBox;
