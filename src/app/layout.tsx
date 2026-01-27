import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import "./custom-styles.css";
import "./responsive.css";
import "./transitions.css";
import "./fonts.css";
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
    <html lang="es" className={`${inter.variable} ${oldEnglish.variable}`}>
      <body className="min-h-screen flex flex-col min-w-0 font-sans custom-scrollbar" style={{ backgroundColor: 'transparent' }}>
        {/* Contenedor de fondo fijo con destellos naranjas intermitentes */}
        <div className="background-container">
          <div className="sparkle-1"></div>
          <div className="sparkle-2"></div>
        </div>
        <ClientLayout>
          {children}
        </ClientLayout>
        <Portal />
      </body>
    </html>
  );
}