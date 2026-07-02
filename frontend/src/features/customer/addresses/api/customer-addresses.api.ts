import {
  getCurrentPublicUser,
  updatePublicAddress,
} from "@/features/auth/services/auth-api";
import { useAuthStore } from "@/store/auth-store";
import {
  mapCustomerAddressDtoToAddress,
} from "../mappers/customer-address.mapper";
import type {
  CustomerAddress,
  CustomerAddressPayload,
} from "../types/customer-address.types";
import type { ApiMutationResponse } from "@/shared/api/api-types";
import {
  buildFullAddress,
  getAddressDetailsFromAddress,
  getProvinceCityFromAddress,
} from "@/shared/location/location-text";

function getAccessTokenOrThrow() {
  const accessToken = useAuthStore.getState().accessToken;

  if (!accessToken) {
    throw new Error("نشست کاربری پیدا نشد. لطفاً دوباره وارد شوید.");
  }

  return accessToken;
}

function buildAddressLineFromPayload(payload: CustomerAddressPayload) {
  return (
    payload.addressLine ||
    buildFullAddress({
      province: payload.province,
      city: payload.city,
      details: payload.details,
    })
  );
}

function buildAddressFromPayload(
  payload: CustomerAddressPayload
): CustomerAddress {
  return {
    id: "current",
    title: payload.title || "آدرس فعلی",
    province: payload.province,
    city: payload.city,
    details: payload.details,
    addressLine: buildAddressLineFromPayload(payload),
    isDefault: true,
  };
}

function buildAddressFromAuthAddress(address: string | null | undefined) {
  const addressLine = address?.trim();

  if (!addressLine) return null;

  const provinceCity = getProvinceCityFromAddress(addressLine);
  const details = getAddressDetailsFromAddress(addressLine);

  return mapCustomerAddressDtoToAddress({
    id: "current",
    title: "آدرس فعلی",
    province: provinceCity.province,
    city: provinceCity.city,
    details,
    addressLine,
    isDefault: true,
  });
}

export const customerAddressesApi = {
  async getCustomerAddresses(): Promise<CustomerAddress[]> {
    const accessToken = getAccessTokenOrThrow();

    const response = await getCurrentPublicUser(accessToken);

    const currentAddress = buildAddressFromAuthAddress(response.user.address);

    return currentAddress ? [currentAddress] : [];
  },

  async createCustomerAddress(
    payload: CustomerAddressPayload
  ): Promise<CustomerAddress> {
    const accessToken = getAccessTokenOrThrow();
    const addressLine = buildAddressLineFromPayload(payload);

    const session = await updatePublicAddress({
      accessToken,
      address: addressLine,
    });

    useAuthStore.getState().setSession(session);

    return buildAddressFromPayload({
      ...payload,
      addressLine,
    });
  },

  async updateCustomerAddress(
    _addressId: number | string,
    payload: CustomerAddressPayload
  ): Promise<CustomerAddress> {
    const accessToken = getAccessTokenOrThrow();
    const addressLine = buildAddressLineFromPayload(payload);

    const session = await updatePublicAddress({
      accessToken,
      address: addressLine,
    });

    useAuthStore.getState().setSession(session);

    return buildAddressFromPayload({
      ...payload,
      addressLine,
    });
  },

  async deleteCustomerAddress(
    _addressId: number | string
  ): Promise<ApiMutationResponse> {
    const accessToken = getAccessTokenOrThrow();

    const session = await updatePublicAddress({
      accessToken,
      address: null,
    });

    useAuthStore.getState().setSession(session);

    return {
      message: "آدرس با موفقیت حذف شد.",
    };
  },

  async setDefaultCustomerAddress(
    _addressId: number | string
  ): Promise<ApiMutationResponse> {
    return {
      message: "آدرس فعلی با موفقیت انتخاب شد.",
    };
  },
};