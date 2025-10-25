"use client";

import { formatCurrency } from "@/utils/formatters";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#60a5fa", "#34d399", "#fbbf24", "#f87171", "#f472b6", "#a78bfa", "#22d3ee"]; 

export function StatsCards({
  totalServicios,
  ticketPromedio,
  nuevos,
  recurrentes,
  inactivos,
  desgloseTipo,
}: {
  totalServicios: number;
  ticketPromedio: number;
  nuevos: number;
  recurrentes: number;
  inactivos: number;
  desgloseTipo: { name: string; value: number }[];
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <Card title="Total servicios" value={String(totalServicios)} />
        <Card title="Ticket promedio" value={formatCurrency(ticketPromedio)} />
        <Card title="Clientes nuevos" value={String(nuevos)} />
        <Card title="Recurrentes" value={String(recurrentes)} />
        <Card title="Inactivos (90d)" value={String(inactivos)} />
      </div>

      <div className="rounded-lg border border-white/10 p-3">
        <div className="mb-2 text-sm opacity-80">Desglose por tipo de servicio</div>
        <div className="h-64">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={desgloseTipo} dataKey="value" nameKey="name" outerRadius={90} label>
                {desgloseTipo.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 p-3">
      <div className="text-xs opacity-70">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}