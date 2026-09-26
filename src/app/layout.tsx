import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/common/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FLUXO — Operations Command Center",
  description: "Production-ready inventory management SaaS platform. Where Stock Flows Smarter.",
  keywords: ["Inventory", "SaaS", "Logistics", "Supply Chain", "Warehouse Operations"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} dark antialiased h-full`}
    >
      <body className="min-h-full bg-[#090a10] text-[#f4f4f5] font-sans flex flex-col selection:bg-[#7c3aed] selection:text-white" suppressHydrationWarning>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>

  );
}
