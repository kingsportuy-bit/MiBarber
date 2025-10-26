"use client";

import { ReactNode } from "react";

type ContentLayoutProps = {
  children: ReactNode;
};

export function ContentLayout({ children }: ContentLayoutProps) {
  return (
    <div className="qoder-dark-window-no-shadow overflow-hidden">
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}