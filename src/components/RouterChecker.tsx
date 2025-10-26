"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function RouterChecker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [routerState, setRouterState] = useState<any>({});
  const shouldShow = process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (!shouldShow) return;
    
    const state = {
      pathname,
      searchParams: searchParams?.toString() || null,
      timestamp: new Date().toISOString()
    };
    
    console.log("RouterChecker - Router state:", state);
    setRouterState(state);
  }, [pathname, searchParams, shouldShow]);

  // Mover el retorno condicional al final del componente
  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed bottom-64 right-0 bg-rose-600 text-white p-3 text-xs z-50 max-w-md">
      <h3 className="font-bold mb-2">Router Checker</h3>
      <div className="max-h-32 overflow-y-auto">
        <p><strong>Pathname:</strong> {pathname}</p>
        <p><strong>Search Params:</strong> {searchParams?.toString() || 'None'}</p>
        <p><strong>Timestamp:</strong> {routerState.timestamp}</p>
      </div>
    </div>
  );
}