"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CajaRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.push("/en-desarrollo");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-qoder-dark-bg-primary">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-qoder-dark-accent-primary"></div>
    </div>
  );
}
