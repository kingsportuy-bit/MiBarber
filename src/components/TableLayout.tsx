"use client";

import React, { ReactNode } from "react";

type TableLayoutProps = {
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
  };
  sort?: {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
  };
};

export function TableLayout({ title, children, actions, search, sort }: TableLayoutProps) {
  return (
    <div className="space-y-4 h-full flex flex-col">
      {(search || sort || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {search && (
              <input
                value={search.value}
                onChange={(e) => search.onChange(e.target.value)}
                placeholder={search.placeholder}
                className="qoder-dark-search-box w-full max-w-md py-3 px-4"
              />
            )}
            {sort && (
              <select 
                value={sort.value} 
                onChange={(e) => sort.onChange(e.target.value)}
                className="qoder-dark-select py-3 px-4"
              >
                {sort.options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}

      {/* Contenedor de la tabla con altura responsiva */}
      <div className="bg-qoder-dark-bg-secondary flex-grow flex flex-col h-full overflow-hidden">
        {title && (
          <div className="pb-2">
            <h2 className="font-semibold text-qoder-dark-text-primary">{title}</h2>
          </div>
        )}
        <div className="bg-qoder-dark-bg-secondary flex-grow overflow-hidden h-full">
          {children}
        </div>
      </div>
    </div>
  );
}