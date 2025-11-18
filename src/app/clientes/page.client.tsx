"use client";

import { useState } from "react";
import Head from 'next/head';
import { usePageTitle } from "@/hooks/usePageTitle";
import { ClientsTable } from "@/components/ClientsTable";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";

export default function ClientesPageClient() {
  // Establecer el título de la página
  usePageTitle("Barberox | Clientes");
  
  return (
    <AdminProtectedRoute>
      <Head>
        <title>Barberox | Clientes</title>
      </Head>
      <div className="flex flex-col h-full">
        <div className="flex-grow">
          <ClientsTable />
        </div>
      </div>
    </AdminProtectedRoute>
  );
}