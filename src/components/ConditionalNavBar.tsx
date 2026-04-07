"use client";

import { usePathname } from "next/navigation";
import { NavBar } from "@/components/NavBar";

export function ConditionalNavBar() {
  const pathname = usePathname();
  
  // No mostrar el NavBar en la página de administración, registro o login
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/registro') || pathname?.startsWith('/login')) {
    return null;
  }
  
  return <NavBar />;
}