import type { Metadata } from "next";
import { AuthSessionProvider } from "@/features/auth/components/AuthSessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Digcheh Auth",
  description: "Authentication page for Digcheh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <AuthSessionProvider>
          <div className="h-screen w-screen gap-15 overflow-x-hidden">
            {children}
          </div>
        </AuthSessionProvider>
      </body>
    </html>
  );
}