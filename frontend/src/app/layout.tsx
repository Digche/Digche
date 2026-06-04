import type { Metadata } from "next";
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
      <body>{children}</body>
    </html>
  );
}