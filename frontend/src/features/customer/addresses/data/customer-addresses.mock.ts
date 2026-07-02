import type { CustomerAddress } from "../types/customer-address.types";

export const customerAddresses: CustomerAddress[] = [
  {
    id: 1,
    title: "دانشگاه",
    province: "مازندران",
    city: "بابل",
    details: "خیابان شریعتی",
    addressLine: "مازندران، بابل، خیابان شریعتی",
    isDefault: true,
  },
  {
    id: 2,
    title: "خانه",
    province: "مازندران",
    city: "بابل",
    details: "خیابان مدرس، کوچه نسترن، پلاک ۱۲",
    addressLine: "مازندران، بابل، خیابان مدرس، کوچه نسترن، پلاک ۱۲",
    isDefault: false,
  },
];