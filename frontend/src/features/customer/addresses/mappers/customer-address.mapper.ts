import type {
  CustomerAddress,
  CustomerAddressDto,
} from "../types/customer-address.types";

function buildAddressLine(province?: string, city?: string, details?: string) {
  return [province, city, details].filter(Boolean).join("، ");
}

export function mapCustomerAddressDtoToAddress(
  dto: CustomerAddressDto
): CustomerAddress {
  const province = dto.province ?? "";
  const city = dto.city ?? "";
  const details = dto.details ?? "";

  const fallbackAddressLine =
    dto.addressLine ??
    dto.address ??
    dto.fullAddress ??
    buildAddressLine(province, city, details);

  return {
    id: dto.id ?? crypto.randomUUID(),
    title: dto.title ?? dto.name ?? "آدرس",
    province,
    city,
    details,
    addressLine: fallbackAddressLine,
    isDefault: Boolean(dto.isDefault ?? dto.is_default),
  };
}

export function mapCustomerAddressDtosToAddresses(
  dtos: CustomerAddressDto[]
): CustomerAddress[] {
  return dtos.map(mapCustomerAddressDtoToAddress);
}