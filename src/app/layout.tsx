import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { GeneralLayout } from "@/components/GeneralLayout";
import { ConditionalNavBar } from "@/components/ConditionalNavBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MiBarber",
  description: "Barber shop management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-qoder-dark-bg-primary text-qoder-dark-text-primary min-h-screen flex flex-col min-w-0">
        <Providers>
          <ConditionalNavBar />
          <GeneralLayout>
            {children}
          </GeneralLayout>
        </Providers>
      </body>
    </html>
  );
}