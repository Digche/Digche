"use client";

import CustomerProfileBadge from "@/features/customer/components/CustomerProfileBadge";
import CustomerAddressCard from "./AddressCard";
import { customerAddresses } from "../data/customer-addresses.mock";

export default function CustomerAddressesScreen() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)]">
      <div className="absolute left-0 top-0 hidden md:block">
        <CustomerProfileBadge />
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-col items-center">
        <h1 className="mb-12 mt-4 text-right text-2xl font-bold text-gray-950 md:text-3xl">
          👋 خوش اومدی!
        </h1>

        <div className="w-full max-w-4xl rounded-md border border-gray-950 bg-white px-8 py-8 shadow-sm md:min-h-87.5">
          {customerAddresses.length === 0 ? (
            <div className="flex min-h-55 items-center justify-center">
              <p className="text-sm text-gray-500">
                هنوز آدرسی ثبت نکرده‌اید.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {customerAddresses.map((address) => (
                <CustomerAddressCard key={address.id} address={address} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}