import type { Metadata } from "next";
import { AuthSessionProvider } from "@/features/auth/components/AuthSessionProvider";
import "./globals.css";
import { ReactQueryProvider } from "@/shared/providers/ReactQueryProvider";

export const metadata: Metadata = {
  title: "Digcheh",
  description: "Digcheh home-made food marketplace",
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
            <ReactQueryProvider>
          <div className="h-screen w-screen gap-15 overflow-x-hidden">
            {children}
          </div>  
          </ReactQueryProvider>

        </AuthSessionProvider>
      </body>
    </html>
  );
}