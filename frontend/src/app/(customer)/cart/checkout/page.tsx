import { AuthRouteGuard } from "@/features/auth/components/AuthRouteGuard";
import CartCheckoutScreen from "@/features/cart/component/CartCheckoutScreen";

export default function CartCheckoutPage() {
  return (
    <AuthRouteGuard allowedRoles={["customer"]}>
      <CartCheckoutScreen />
    </AuthRouteGuard>
  );
}