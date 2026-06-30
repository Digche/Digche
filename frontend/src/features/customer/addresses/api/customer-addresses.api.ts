import { apiRequest } from "@/shared/api/api-client";
import { endpoints } from "@/shared/api/endpoints";
import type { ApiMutationResponse, ApiResponse } from "@/shared/api/api-types";
import {
  mapCustomerAddressDtoToAddress,
  mapCustomerAddressDtosToAddresses,
} from "../mappers/customer-address.mapper";
import type {
  CustomerAddress,
  CustomerAddressDto,
  CustomerAddressPayload,
} from "../types/customer-address.types";

function unwrapData<T>(response: T | ApiResponse<T>): T {
  if (response && typeof response === "object" && "data" in response) {
    return (response as ApiResponse<T>).data;
  }

  return response as T;
}

function buildAddressLineFromPayload(payload: CustomerAddressPayload) {
  return (
    payload.addressLine ||
    [payload.province, payload.city, payload.details].filter(Boolean).join("، ")
  );
}

function buildAddressFromPayload(
  id: number | string,
  payload: CustomerAddressPayload
): CustomerAddress {
  return {
    id,
    title: payload.title,
    province: payload.province,
    city: payload.city,
    details: payload.details,
    addressLine: buildAddressLineFromPayload(payload),
    isDefault: false,
  };
}

function mergeAddressWithPayload(
  address: CustomerAddress,
  payload: CustomerAddressPayload
): CustomerAddress {
  return {
    ...address,
    title: address.title || payload.title,
    province: address.province || payload.province,
    city: address.city || payload.city,
    details: address.details || payload.details,
    addressLine: address.addressLine || buildAddressLineFromPayload(payload),
  };
}

export const customerAddressesApi = {
  async getCustomerAddresses(): Promise<CustomerAddress[]> {
    const response = await apiRequest<
      CustomerAddressDto[] | ApiResponse<CustomerAddressDto[]>
    >(endpoints.customerAddresses.list, {
      auth: true,
    });

    const data = unwrapData(response);

    return mapCustomerAddressDtosToAddresses(data);
  },

  async createCustomerAddress(
    payload: CustomerAddressPayload
  ): Promise<CustomerAddress> {
    const response = await apiRequest<
      | CustomerAddressDto
      | string
      | number
      | ApiResponse<CustomerAddressDto | string | number>
    >(endpoints.customerAddresses.create, {
      method: "POST",
      body: payload,
      auth: true,
    });

    const data = unwrapData(response);

    if (typeof data === "string" || typeof data === "number") {
      return buildAddressFromPayload(data, payload);
    }

    const mappedAddress = mapCustomerAddressDtoToAddress(data);

    return mergeAddressWithPayload(mappedAddress, payload);
  },

  async updateCustomerAddress(
    addressId: number | string,
    payload: CustomerAddressPayload
  ): Promise<CustomerAddress> {
    const response = await apiRequest<
      | CustomerAddressDto
      | string
      | number
      | ApiResponse<CustomerAddressDto | string | number>
    >(endpoints.customerAddresses.update(addressId), {
      method: "PUT",
      body: payload,
      auth: true,
    });

    const data = unwrapData(response);

    if (typeof data === "string" || typeof data === "number") {
      return buildAddressFromPayload(data, payload);
    }

    const mappedAddress = mapCustomerAddressDtoToAddress({
      ...data,
      id: data.id ?? addressId,
    });

    return mergeAddressWithPayload(mappedAddress, payload);
  },

  async deleteCustomerAddress(
    addressId: number | string
  ): Promise<ApiMutationResponse> {
    await apiRequest<unknown>(endpoints.customerAddresses.delete(addressId), {
      method: "DELETE",
      auth: true,
    });

    return {
      message: "آدرس با موفقیت حذف شد.",
    };
  },

  async setDefaultCustomerAddress(
    addressId: number | string
  ): Promise<ApiMutationResponse> {
    await apiRequest<unknown>(
      endpoints.customerAddresses.setDefault(addressId),
      {
        method: "PATCH",
        auth: true,
      }
    );

    return {
      message: "آدرس فعلی با موفقیت تغییر کرد.",
    };
  },
};