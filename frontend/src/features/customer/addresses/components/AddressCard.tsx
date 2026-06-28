import { MapPin } from "lucide-react";
import type { CustomerAddress } from "../types/customer-address.types";

type CustomerAddressCardProps = {
  address: CustomerAddress;
};

export default function CustomerAddressCard({
  address,
}: CustomerAddressCardProps) {
  return (
    <article className="rounded-lg border border-gray-400 bg-white px-5 py-3">
      <div className="flex items-center justify-end gap-2">
        <h3 className="text-sm font-bold text-gray-900">{address.title}</h3>
        <MapPin size={16} className="text-gray-800" />
      </div>

      <div className="mt-2 border-t border-gray-300 pt-2">
        <p className="text-right text-sm leading-7 text-gray-800">
          {address.addressLine}
        </p>
      </div>
    </article>
  );
}