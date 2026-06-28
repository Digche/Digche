import type { CustomerAddress } from "../types/customer-address.types";

export const customerAddresses: CustomerAddress[] = [
  {
    id: 1,
    title: "دانشگاه",
    addressLine: "مازندران، بابل، خیابان شریعتی",
    isDefault: true,
  },
  {
    id: 2,
    title: "خانه",
    addressLine: "مازندران، بابل، محله 24",
  },
];