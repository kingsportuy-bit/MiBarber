"use client";

import { ReactNode } from "react";

interface KanbanLayoutProps {
  children: ReactNode;
  navbarHeight?: number;
  headerContent?: ReactNode;
}

export function KanbanLayout({
  children,
  navbarHeight = 60,
  headerContent,
}: KanbanLayoutProps) {
  return (
    <div 
      className="w-full min-h-screen bg-qoder-dark-bg-primary"
      style={{ paddingTop: `${navbarHeight}px` }}
    >
      {headerContent && (
        <div className="bg-qoder-dark-bg-secondary border-b border-qoder-dark-border-primary px-4 py-3 md:px-6 md:py-4">
          <div className="max-w-[1800px] mx-auto">
            {headerContent}
          </div>
        </div>
      )}
      
      <div className="px-4 py-4 md:px-6 md:py-6">
        <div className="max-w-[1800px] mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}