import type { CustomerOrderHistoryItem } from "../types/customer-order-history.types";

export const customerOrdersHistory: CustomerOrderHistoryItem[] = [
  {
    id: 1001,
    chefName: "راضیه اسلامی",
    foodTitle: "فسنجان خانگی",
    foodImage: "/images/fesenjan.webp",
    quantity: 2,
    totalPrice: "۶۴۰,۰۰۰ تومان",
    status: "delivered",
    orderedAt: "2026-06-28T12:15:00.000Z",
    deliveryAddress: "بابل، خیابان شریعتی",
  },
  {
    id: 1002,
    chefName: "مرضیه احمدی",
    foodTitle: "کباب تابه‌ای",
    foodImage: "/images/kebab.webp",
    quantity: 1,
    totalPrice: "۳۲۰,۰۰۰ تومان",
    status: "preparing",
    orderedAt: "2026-06-29T08:45:00.000Z",
    deliveryAddress: "بابل، محله ۲۴",
  },
  {
    id: 1003,
    chefName: "سمیه رضایی",
    foodTitle: "چیزکیک",
    foodImage: "/images/cheesecake.webp",
    quantity: 1,
    totalPrice: "۲۴۰,۰۰۰ تومان",
    status: "paid",
    orderedAt: "2026-06-26T18:30:00.000Z",
    deliveryAddress: "بابل، میدان کشوری",
  },
];
