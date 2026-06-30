// src/features/customer/addresses/components/CustomerAddressesScreen.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useLocationStore } from "@/store/location-store";
import AddressForm from "./AddressForm";
import CustomerAddressCard from "./AddressCard";
import { useCustomerAddresses } from "../hooks/use-customer-addresses";
import { useCreateCustomerAddress } from "../hooks/use-create-customer-address";
import { useSetDefaultCustomerAddress } from "../hooks/use-set-default-customer-address";
import { useDeleteCustomerAddress } from "../hooks/use-delete-customer-address";
import type {
  CustomerAddress,
  CustomerAddressPayload,
} from "../types/customer-address.types";

function getAddressLocation(address: CustomerAddress) {
  if (address.province && address.city) {
    return `${address.province}، ${address.city}`;
  }

  const parts = address.addressLine
    ?.split("،")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts?.[0] && parts?.[1]) {
    return `${parts[0]}، ${parts[1]}`;
  }

  return address.addressLine;
}

function getAddressFullLine(address: CustomerAddress) {
  if (address.addressLine) return address.addressLine;

  return [address.province, address.city, address.details]
    .filter(Boolean)
    .join("، ");
}

function getAddressProvinceCity(address: CustomerAddress) {
  if (address.province && address.city) {
    return {
      province: address.province,
      city: address.city,
    };
  }

  const parts = address.addressLine
    ?.split("،")
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    province: parts?.[0] ?? "",
    city: parts?.[1] ?? "",
  };
}

export default function CustomerAddressesScreen() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const updateCurrentUser = useAuthStore((state) => state.updateCurrentUser);

  const setSelectedLocation = useLocationStore(
    (state) => state.setSelectedLocation
  );

  const [isFormOpen, setIsFormOpen] = useState(false);

  const {
    data: addresses = [],
    isLoading,
    isError,
  } = useCustomerAddresses({
    enabled: currentUser?.role === "customer",
  });

  const createAddress = useCreateCustomerAddress();
  const setDefaultAddress = useSetDefaultCustomerAddress();
  const deleteAddress = useDeleteCustomerAddress();

  const selectedAddress = useMemo(() => {
    return addresses.find((address) => address.isDefault) ?? addresses[0];
  }, [addresses]);

  useEffect(() => {
    if (!selectedAddress) return;

    const provinceCity = getAddressProvinceCity(selectedAddress);

    if (provinceCity.province && provinceCity.city) {
      setSelectedLocation(provinceCity);
    }

    updateCurrentUser({
      location: getAddressLocation(selectedAddress),
      address: getAddressFullLine(selectedAddress),
    });
  }, [selectedAddress, setSelectedLocation, updateCurrentUser]);

  if (!currentUser || currentUser.role !== "customer") {
    return (
      <section className="flex h-full items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">دسترسی غیرمجاز</h1>

          <p className="mt-2 text-sm text-gray-500">
            فقط مشتری‌ها می‌توانند آدرس‌های خود را مدیریت کنند.
          </p>
        </div>
      </section>
    );
  }

  const handleCreateAddress = (payload: CustomerAddressPayload) => {
    createAddress.mutate(payload, {
      onSuccess: (createdAddress) => {
        setIsFormOpen(false);

        const completedAddress: CustomerAddress = {
          ...createdAddress,
          title: createdAddress.title || payload.title,
          province: createdAddress.province || payload.province,
          city: createdAddress.city || payload.city,
          details: createdAddress.details || payload.details,
          addressLine: createdAddress.addressLine || payload.addressLine,
        };

        setDefaultAddress.mutate(completedAddress.id, {
          onSuccess: () => {
            const provinceCity = getAddressProvinceCity(completedAddress);

            if (provinceCity.province && provinceCity.city) {
              setSelectedLocation(provinceCity);
            }

            updateCurrentUser({
              location: getAddressLocation(completedAddress),
              address: getAddressFullLine(completedAddress),
            });
          },
        });
      },
    });
  };

  const handleSelectAddress = (address: CustomerAddress) => {
    setDefaultAddress.mutate(address.id, {
      onSuccess: () => {
        const provinceCity = getAddressProvinceCity(address);

        if (provinceCity.province && provinceCity.city) {
          setSelectedLocation(provinceCity);
        }

        updateCurrentUser({
          location: getAddressLocation(address),
          address: getAddressFullLine(address),
        });
      },
    });
  };

  return (
    <section dir="rtl" className="relative h-full overflow-hidden">
      <div className="flex h-full flex-col px-5 py-6 sm:px-7 lg:px-8">
        <div className="shrink-0">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="text-right">
              <h1 className="text-2xl font-extrabold text-gray-950">
                آدرس‌های من
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                اول استان و شهر را انتخاب کن، بعد جزئیات آدرس را وارد کن.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsFormOpen((prev) => !prev)}
              className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#EFC5A8] px-6 text-sm font-bold text-gray-900 transition hover:bg-[#e9b892]"
            >
              <Plus size={18} />
              افزودن آدرس جدید
            </button>
          </div>

          {selectedAddress && (
            <div className="mt-5 rounded-2xl border border-[#EFC5A8] bg-[#FFF9F4] px-5 py-4 text-right">
              <p className="text-xs font-bold text-[#D16565]">آدرس فعلی</p>

              <h2 className="mt-1 text-sm font-extrabold text-gray-950">
                {selectedAddress.title}
              </h2>

              <p className="mt-1 text-sm font-bold text-gray-800">
                {getAddressLocation(selectedAddress)}
              </p>

              <p className="mt-1 text-sm leading-7 text-gray-700">
                {getAddressFullLine(selectedAddress)}
              </p>
            </div>
          )}

          {isFormOpen && (
            <div className="mt-5">
              <AddressForm
                onSubmit={handleCreateAddress}
                isSubmitting={createAddress.isPending}
                onCancel={() => setIsFormOpen(false)}
              />
            </div>
          )}
        </div>

        <div className="mt-6 min-h-0 flex-1 overflow-y-auto pb-2 pl-2">
          {isLoading ? (
            <div className="rounded-3xl bg-[#FFF9F4] p-10 text-center">
              <h2 className="text-xl font-bold text-gray-800">
                در حال دریافت آدرس‌ها...
              </h2>
            </div>
          ) : isError ? (
            <div className="rounded-3xl bg-[#FFF9F4] p-10 text-center">
              <h2 className="text-xl font-bold text-gray-800">
                دریافت آدرس‌ها ناموفق بود
              </h2>

              <p className="mt-2 text-sm text-red-500">
                وضعیت بک‌اند یا endpoint آدرس‌ها را بررسی کن.
              </p>
            </div>
          ) : addresses.length === 0 ? (
            <div className="rounded-3xl border border-orange-100 bg-[#FFF9F4] p-10 text-center">
              <h2 className="text-xl font-bold text-gray-800">
                هنوز آدرسی ثبت نکرده‌اید
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                با دکمه افزودن آدرس جدید، اولین آدرس خود را ثبت کنید.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <CustomerAddressCard
                  key={address.id}
                  address={address}
                  isSelected={address.id === selectedAddress?.id}
                  isSelecting={setDefaultAddress.isPending}
                  isDeleting={deleteAddress.isPending}
                  onSelect={handleSelectAddress}
                  onDelete={(addressId) => deleteAddress.mutate(addressId)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}