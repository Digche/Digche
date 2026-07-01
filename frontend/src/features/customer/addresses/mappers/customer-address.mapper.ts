import type {
  CustomerAddress,
  CustomerAddressDto,
} from "../types/customer-address.types";
import {
  buildFullAddress,
  getAddressDetailsFromAddress,
  getProvinceCityFromAddress,
} from "@/shared/location/location-text";

export function mapCustomerAddressDtoToAddress(
  dto: CustomerAddressDto
): CustomerAddress {
  const rawAddressLine =
    dto.addressLine ?? dto.address ?? dto.fullAddress ?? "";

  const parsedProvinceCity = getProvinceCityFromAddress(rawAddressLine);

  const province = dto.province ?? parsedProvinceCity.province ?? "";
  const city = dto.city ?? parsedProvinceCity.city ?? "";
  const details =
    dto.details ?? getAddressDetailsFromAddress(rawAddressLine) ?? "";

  const addressLine =
    rawAddressLine ||
    buildFullAddress({
      province,
      city,
      details,
    });

  return {
    id: dto.id ?? "current",
    title: dto.title ?? dto.name ?? "آدرس فعلی",
    province,
    city,
    details,
    addressLine,
    isDefault: Boolean(dto.isDefault ?? dto.is_default ?? true),
  };
}

export function mapCustomerAddressDtosToAddresses(
  dtos: CustomerAddressDto[]
): CustomerAddress[] {
  return dtos.map(mapCustomerAddressDtoToAddress);
}