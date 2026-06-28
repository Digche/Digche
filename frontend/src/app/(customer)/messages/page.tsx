import { AuthRouteGuard } from "@/features/auth/components/AuthRouteGuard";
import ChatFeaturePage from "@/features/chat/components/ChatFeaturePage";

export default function CustomerMessagesPage() {
  return (
    <AuthRouteGuard allowedRoles={["customer"]}>
      <main className="min-h-screen bg-[#FFF1E8] px-4 py-8">
        <ChatFeaturePage mode="customer" />
      </main>
    </AuthRouteGuard>
  );
}
