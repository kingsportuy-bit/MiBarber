"use client";

import { useMemo } from "react";
import type { CajaRecord } from "@/types/db";

export function useFilteredCajaRecords(
  records: CajaRecord[],
  filters: {
    id_cita?: string;
    id_cliente?: string;
    numero_factura?: string;
    fechaDesde?: string;
    fechaHasta?: string;
  }
) {
  const filteredRecords = useMemo(() => {
    if (!records) return [];

    return records.filter(record => {
      // Filtrar por ID de cita
      if (filters.id_cita && record.id_cita && !record.id_cita.toLowerCase().includes(filters.id_cita.toLowerCase())) {
        return false;
      }

      // Filtrar por ID de cliente
      if (filters.id_cliente && record.id_cliente && !record.id_cliente.toLowerCase().includes(filters.id_cliente.toLowerCase())) {
        return false;
      }

      // Filtrar por número de factura (usar campo existente en CajaRecord)
      // El tipo CajaRecord no tiene numero_factura, así que omitimos este filtro
      // Si se agrega este campo en el futuro, se puede descomentar esta sección

      // Filtrar por fecha desde
      if (filters.fechaDesde) {
        const recordDate = new Date(record.fecha);
        const fromDate = new Date(filters.fechaDesde);
        if (recordDate < fromDate) {
          return false;
        }
      }

      // Filtrar por fecha hasta
      if (filters.fechaHasta) {
        const recordDate = new Date(record.fecha);
        const toDate = new Date(filters.fechaHasta);
        // Agregar un día a la fecha hasta para incluir todo el día
        toDate.setDate(toDate.getDate() + 1);
        if (recordDate >= toDate) {
          return false;
        }
      }

      return true;
    });
  }, [records, filters]);

  return filteredRecords;
}