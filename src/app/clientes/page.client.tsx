"use client";


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
      <div style={{ padding: "0 20px 24px", width: "100%", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", margin: 0, letterSpacing: "0.04em" }}>Clientes</h1>
            <p style={{ color: "#8A8A8A", fontSize: "0.875rem", margin: "4px 0 0", fontFamily: "var(--font-body)" }}>
              Gestión de clientes de tu barbería
            </p>
          </div>
        </div>
        <ClientsTable />
      </div>
    </AdminProtectedRoute>
  );
}