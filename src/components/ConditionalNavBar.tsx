"use client";

import { usePathname } from "next/navigation";
import { NavBar } from "@/components/NavBar";

export function ConditionalNavBar() {
  const pathname = usePathname();
  
  // No mostrar el NavBar en la página de administración
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  
  return <NavBar />;
}