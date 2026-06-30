export type CustomerAddress = {
  id: number | string;
  title: string;
  province: string;
  city: string;
  details: string;
  addressLine: string;
  isDefault?: boolean;
};

export type CustomerAddressDto = {
  id?: number | string;
  title?: string;
  name?: string;

  province?: string;
  city?: string;
  details?: string;

  addressLine?: string;
  address?: string;
  fullAddress?: string;

  isDefault?: boolean;
  is_default?: boolean;
};

export type CustomerAddressPayload = {
  title: string;
  province: string;
  city: string;
  details: string;
  addressLine: string;
};