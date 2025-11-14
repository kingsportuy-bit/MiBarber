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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-qoder-dark-text-primary">Gestión de Clientes</h2>
        </div>
        <div className="flex-grow">
          <ClientsTable />
        </div>
      </div>
    </AdminProtectedRoute>
  );
}