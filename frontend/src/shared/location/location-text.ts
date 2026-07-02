import type { ProvinceCityValue } from "@/shared/location/types/location.types";

export const emptyProvinceCity: ProvinceCityValue = {
  province: "",
  city: "",
};

const ADDRESS_TITLE_SEPARATOR = "|";

function normalizeAddressText(address?: string | null) {
  return String(address ?? "").trim();
}

export function splitAddressTitle(address?: string | null) {
  const addressText = normalizeAddressText(address);

  if (!addressText) {
    return {
      title: "خانه",
      addressBody: "",
    };
  }

  const separatorIndex = addressText.indexOf(ADDRESS_TITLE_SEPARATOR);

  if (separatorIndex === -1) {
    return {
      title: "خانه",
      addressBody: addressText,
    };
  }

  const title = addressText.slice(0, separatorIndex).trim();
  const addressBody = addressText.slice(separatorIndex + 1).trim();

  return {
    title: title || "خانه",
    addressBody,
  };
}

function splitAddressParts(address?: string | null) {
  const { addressBody } = splitAddressTitle(address);

  return addressBody
    .split(/[،,]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function getAddressTitleFromAddress(address?: string | null) {
  return splitAddressTitle(address).title;
}

export function getAddressBodyFromAddress(address?: string | null) {
  return splitAddressTitle(address).addressBody;
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
  title?: string | null;
  province?: string | null;
  city?: string | null;
  details?: string | null;
}) {
  const title = input.title?.trim() || "خانه";

  const addressBody = [input.province, input.city, input.details]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join("، ");

  if (!addressBody) {
    return "";
  }

  return `${title} ${ADDRESS_TITLE_SEPARATOR} ${addressBody}`;
}

export function getProvinceCityLabel(address?: string | null) {
  const { province, city } = getProvinceCityFromAddress(address);

  if (!province || !city) return "";

  return `${province}، ${city}`;
}