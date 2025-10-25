"use client";

import { ReactNode } from "react";

type WindowLayoutProps = {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function WindowLayout({ title, actions, children }: WindowLayoutProps) {
  return (
    <div className="qoder-dark-window w-full flex flex-col flex-grow h-full">
      <div className="qoder-dark-window-header">
        <h1 className="text-xl font-bold text-qoder-dark-text-primary">{title}</h1>
        {actions && <div>{actions}</div>}
      </div>
      <div className="qoder-dark-window-content flex-grow overflow-hidden h-full">
        {children}
      </div>
    </div>
  );
}