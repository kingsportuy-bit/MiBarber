import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import "./custom-styles.css";
import "./responsive.css";
import "./transitions.css";
import "./fonts.css";
import "./(v2)/globals-v2.css";
import ClientLayout from "./client-layout";
import { Portal } from '@radix-ui/react-portal';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const oldEnglish = localFont({
  src: "./fonts/old-english.ttf",
  variable: "--font-old-english",
  display: "swap",
});

const rasputin = localFont({
  src: "./fonts/Rasputin.otf",
  variable: "--font-rasputin",
  display: "swap",
});

import { BackgroundScene } from "@/components/BackgroundScene";
import { ShootingStars } from "@/components/ShootingStars";

export const metadata: Metadata = {
  title: {
    template: '%s',
    default: 'Barberox',
  },
  description: "Barber shop management system",

  viewport: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${oldEnglish.variable} ${rasputin.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col min-w-0 font-sans custom-scrollbar" style={{ backgroundColor: 'transparent' }} suppressHydrationWarning>
        <BackgroundScene />
        <ShootingStars />
        <ClientLayout>
          {children}
        </ClientLayout>
        <Portal />
      </body>
    </html>
  );
}