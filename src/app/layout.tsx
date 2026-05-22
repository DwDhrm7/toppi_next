import type { Metadata } from "next";
import { Inter } from "next/font/google";
import QueryProvider from "../components/layout/QueryProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TOPPI",
  description: "DASHBOARD MONITORING",
  icons: {
    icon: "/assets/icon/toppi-black.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
