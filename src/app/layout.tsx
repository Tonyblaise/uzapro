import type { Metadata } from "next";
import localFont from "next/font/local";
import { StoreProvider } from "@/data";
import { Toast } from "@/components/ui/Toast";
import "@/styles/globals.css";

const inter = localFont({
  src: [
    { path: "./fonts/Inter-latin.woff2", weight: "400 700", style: "normal" },
    { path: "./fonts/Inter-latin-ext.woff2", weight: "400 700", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UzaPro",
  description: "UzaPro ERP demo prototype",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-KE" className={inter.variable}>
      <body className="min-h-screen bg-canvas text-text antialiased">
        <StoreProvider>
          {children}
          <Toast />
        </StoreProvider>
      </body>
    </html>
  );
}
