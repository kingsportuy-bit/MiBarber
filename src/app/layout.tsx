import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./custom-styles.css";
import { Providers } from "@/components/Providers";
import { GeneralLayout } from "@/components/GeneralLayout";
import { ConditionalNavBar } from "@/components/ConditionalNavBar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Barberox",
  description: "Barber shop management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-screen flex flex-col min-w-0 font-sans" style={{ backgroundColor: 'transparent' }}>
        {/* Contenedor de fondo fijo con destellos naranjas intermitentes */}
        <div className="background-container">
          <div className="sparkle-1"></div>
          <div className="sparkle-2"></div>
        </div>
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