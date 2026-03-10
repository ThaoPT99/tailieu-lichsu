import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";

const beVietnam = Be_Vietnam_Pro({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-be-vietnam",
});

export const metadata: Metadata = {
  title: "Tài Liệu Lịch Sử - Giáo án & Tài liệu giảng dạy",
  description: "Kho tài liệu giáo án lịch sử cấp 2 - Xem miễn phí, tải xuống có phí",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${beVietnam.variable} font-sans antialiased`}>
        <Header />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
