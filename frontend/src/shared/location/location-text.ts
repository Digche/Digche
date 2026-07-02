import type { ProvinceCityValue } from "@/shared/location/types/location.types";

export const emptyProvinceCity: ProvinceCityValue = {
  province: "",
  city: "",
};

function splitAddressParts(address?: string | null) {
  return String(address ?? "")
    .split(/[،,]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function getProvinceCityFromAddress(
  address?: string | null
): ProvinceCityValue {
  const parts = splitAddressParts(address);

  return {
    province: parts[0] ?? "",
    city: parts[1] ?? "",
  };
}

export function getAddressDetailsFromAddress(address?: string | null) {
  const parts = splitAddressParts(address);

  return parts.slice(2).join("، ");
}

export function buildFullAddress(input: {
  province?: string | null;
  city?: string | null;
  details?: string | null;
}) {
  return [input.province, input.city, input.details]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join("، ");
}

export function getProvinceCityLabel(address?: string | null) {
  const { province, city } = getProvinceCityFromAddress(address);

  if (!province || !city) return "";

  return `${province}، ${city}`;
}