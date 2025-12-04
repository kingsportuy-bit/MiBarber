"use client";

import { QoderFooter } from "@/components/QoderFooter";
import { PullToRefresh } from "@/components/PullToRefresh";

export function DefaultLayout({ 
  children,
  onRefresh
}: { 
  children: React.ReactNode;
  onRefresh: () => void;
}) {
  return (
    <PullToRefresh onRefresh={onRefresh}>
      <div className="dashboard pb-16 md:pb-0">
        <div className="dashboard-content">
          <div className="flex-grow flex flex-col flex-1 min-w-0">
            {children}
          </div>
        </div>
        <QoderFooter />
        {/* Espacio transparente para el menú inferior en móviles */}
        <div className="h-16 md:hidden bg-transparent"></div>
      </div>
    </PullToRefresh>
  );
}