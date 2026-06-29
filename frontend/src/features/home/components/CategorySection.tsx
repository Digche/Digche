// import React from 'react';
// import Image from 'next/image';

// const categories = [
//   { id: 1, title: 'صبحانه', image: '/images/breakfast.webp' },
//   { id: 2, title: 'دسر', image: '/images/dessert.webp' },
//   { id: 3, title: 'غذاهای کبابی', image: '/images/kebab.webp' },
//   { id: 4, title: 'خورشت', image: '/images/stew.webp' },
//   { id: 5, title: 'چاشنی', image: '/images/condiments.webp' },
//   { id: 6, title: 'کوکو و کتلت', image: '/images/cutlet.webp' },
//   { id: 7, title: 'غذاهای رژیمی', image: '/images/dietary.webp' },
//   { id: 8, title: 'غذاهای ملاقه ای', image: '/images/soups.webp' },
//   { id: 9, title: 'کیک و شیرینی', image: '/images/cake.webp' },
//   { id: 10, title: 'ماکارونی و پاستا', image: '/images/pasta.webp' },
// ];

// export default function CategorySection() {
//   return (
//     <section className="max-w-7xl mx-auto px-6 py-12" dir="rtl">
//       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10">
//         {categories.map((category) => (
//           <div key={category.id} className="flex flex-col items-center group cursor-pointer">

//             <div className="relative w-full aspect-square overflow-hidden rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-105">
//               <Image
//                 src={category.image}
//                 alt={category.title}
//                 fill
//                 className="object-cover"
//               />
//             </div>
            
//             <h3 className="mt-4 text-gray-800 font-medium text-lg md:text-xl transition-colors group-hover:text-orange-700">
//               {category.title}
//             </h3>
//           </div>
//         ))}
//       </div>

//     </section>
//   );
// };

// ;
