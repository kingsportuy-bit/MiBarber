"use client";

import { useAuth } from "@/components/Providers";
import { useEffect } from "react";

export function ProviderStateChecker() {
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    // Solo ejecutar en desarrollo
    if (process.env.NODE_ENV !== 'development') {
      return;
    }
    
    console.log("=== ProviderStateChecker ===");
    console.log("Provider user:", user);
    console.log("Provider loading:", loading);
    console.log("Provider user ID:", user?.id);
    console.log("Provider user email:", user?.email);
    console.log("=== End ProviderStateChecker ===");
  }, [user, loading]);

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-48 right-0 bg-indigo-500 text-white p-2 text-xs z-50">
      <div className="flex flex-col gap-1">
        <span>Provider State</span>
        <span>User: {user ? '✓' : '✗'}</span>
        <span>Loading: {loading ? '✓' : '✗'}</span>
        {user && (
          <>
            <span>ID: {user.id?.substring(0, 8)}...</span>
            <span>Email: {user.email}</span>
          </>
        )}
      </div>
    </div>
  );
}