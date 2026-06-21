// src/data/foods.js

export const foods = [
  {
    id: 1,
    title: "فسنجان",
    category: "خورشت",
    rating: 3.5,
    remaining: "۲ پرس باقیمانده",
    chef: "دستپخت خانم ایکس",
    chefId: 11,
    location: "تهران",
    price: "۳۰۰,۰۰۰ ",
    unit: "تومان",
    image: "/images/fesenjan.webp",
    description:
      "فسنجان خانگی با گردوی تازه و رب انار، مناسب برای ناهار و شام.",
  },
  {
    id: 2,
    title: "ترشی اسپانیایی",
    category: "چاشنی",
    rating: 4.8,
    remaining: "۲ کیلو باقیمانده",
    chef: "دستپخت خانم ایکس",
    chefId: 11,
    location: "تهران",
    price: "۸۰,۰۰۰ ",
    unit: "یک کیلو",
    image: "/images/torshi.webp",
    description:
      "ترشی اسپانیایی تند و خوش‌عطر، مناسب کنار انواع غذاهای خانگی.",
  },
  {
    id: 3,
    title: "چیزکیک آلبالو",
    category: "دسر",
    rating: 4.2,
    remaining: "۳ پرس باقیمانده",
    chef: "دستپخت خانم ایکس",
    chefId: 11,
    location: "تهران",
    price: "۲۵۰,۰۰۰ ",
    unit: "یک کیلو",
    image: "/images/cheesecake.webp",
    description:
      "چیزکیک آلبالو خانگی با طعم متعادل شیرینی و ترشی آلبالو.",
  },
  {
    id: 4,
    title: "ترشی اسپانیایی",
    category: "چاشنی",
    rating: 4.8,
    remaining: "۲ کیلو باقیمانده",
    chef: "دستپخت خانم ایکس",
    chefId: 11,
    location: "تهران",
    price: "۸۰,۰۰۰ ",
    unit: "یک کیلو",
    image: "/images/torshi.webp",
    description:
      "ترشی اسپانیایی تند و خوش‌عطر، مناسب کنار انواع غذاهای خانگی.",
  },
  {
    id: 5,
    title: "چیزکیک آلبالو",
    category: "دسر",
    rating: 4.2,
    remaining: "۳ پرس باقیمانده",
    chef: "دستپخت خانم ایکس",
    chefId: 11,
    location: "تهران",
    price: "۲۵۰,۰۰۰ ",
    unit: "یک کیلو",
    image: "/images/cheesecake.webp",
    description:
      "چیزکیک آلبالو خانگی با طعم متعادل شیرینی و ترشی آلبالو.",
  },
];

export function getFoodById(foodID) {
  return foods.find((food) => food.id === Number(foodID));
}