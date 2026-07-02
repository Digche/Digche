import { AuthRouteGuard } from "@/features/auth/components/AuthRouteGuard";
import CustomerAddressesScreen from "@/features/customer/addresses/components/CustomerAddressesScreen";

type CustomerAddressesPageProps = {
  searchParams?: {
    returnTo?: string | string[];
    lockCity?: string | string[];
  };
};

function getSearchParamValue(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default function CustomerAddressesPage({
  searchParams,
}: CustomerAddressesPageProps) {
  const returnTo = getSearchParamValue(searchParams?.returnTo);
  const lockCity = getSearchParamValue(searchParams?.lockCity) === "true";

  return (
    <AuthRouteGuard allowedRoles={["customer"]}>
      <CustomerAddressesScreen returnTo={returnTo} lockCity={lockCity} />
    </AuthRouteGuard>
  );
}