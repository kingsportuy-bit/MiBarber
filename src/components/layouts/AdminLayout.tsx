"use client";

import { QoderFooter } from "@/components/QoderFooter";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex-grow pb-16 md:pb-0">
        {children}
      </div>
      <QoderFooter />
      {/* Espacio transparente para el menú inferior en móviles */}
      <div className="h-16 md:hidden bg-transparent"></div>
    </>
  );
}