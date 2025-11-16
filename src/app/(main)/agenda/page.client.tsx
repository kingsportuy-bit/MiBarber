"use client";

import { useState, useEffect } from "react";
import Head from 'next/head';
import { usePageTitle } from "@/hooks/usePageTitle";
import { useCitas } from "@/hooks/useCitas";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { SingleFormAppointmentModalWithSucursal } from "@/components/SingleFormAppointmentModalWithSucursal";
import { CalendarWithBloqueos } from "@/components/CalendarWithBloqueos";
import { GlobalFilters } from "@/components/shared/GlobalFilters";
import type { Appointment } from "@/types/db";
import { toast } from "sonner";
import { useGlobalFilters } from "@/hooks/useGlobalFilters";
import { FloatingNewAppointmentButton } from "@/components/FloatingNewAppointmentButton";
import { getLocalDateString, getLocalDateTime } from "@/shared/utils/dateUtils";

export default function AgendaPageClient() {
  usePageTitle("Barberox | Agenda");

  const { idBarberia, barbero, isAdmin } = useBarberoAuth();
  const { filters } = useGlobalFilters();

  console.log('Datos de autenticacion:', { idBarberia, barbero, isAdmin });

  const { data: citasData, isLoading, error, refetch } = useCitas({
    sucursalId: filters.sucursalId || undefined,
    barberoId: filters.barberoId || undefined,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const handleOpenModal = (appointment?: Appointment) => {
    setSelectedAppointment(appointment || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    handleOpenModal(appointment);
  };

  // Efecto para escuchar el evento personalizado
  useEffect(() => {
    const handleOpenModalEvent = () => {
      console.log('Recibiendo evento openNewAppointmentModal en agenda');
      // Crear una nueva cita con la fecha actual
      const currentDate = getLocalDateTime();
      const newAppointment: Partial<Appointment> = {
        fecha: getLocalDateString(currentDate),
        hora: "",
        servicio: "",
        barbero: ""
      };
      
      setSelectedAppointment(newAppointment as Appointment);
      setIsModalOpen(true);
    };
    
    window.addEventListener('openNewAppointmentModal', handleOpenModalEvent);
    
    return () => {
      window.removeEventListener('openNewAppointmentModal', handleOpenModalEvent);
    };
  }, []);

  useEffect(() => {
    if (idBarberia) {
      refetch();
    }
  }, [idBarberia, filters.sucursalId, filters.barberoId, refetch]);

  if (error) {
    return <div>Error al cargar las citas: {error.message}</div>;
  }

  return (
    <>
      <Head>
        <title>Barberox | Agenda</title>
      </Head>

      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        <GlobalFilters showDateFilters={false} />

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
          <CalendarWithBloqueos
            sucursalId={filters.sucursalId || undefined}
            barbero={filters.barberoId || undefined}
            onEdit={handleAppointmentClick}
            onDateSelect={(date) => console.log("Fecha seleccionada:", date)}
          />
        </div>

        <SingleFormAppointmentModalWithSucursal
          open={isModalOpen}
          onOpenChange={handleCloseModal}
          initial={selectedAppointment || undefined}
        />
      </div>
      
      {/* Botón flotante de nuevo turno */}
      <FloatingNewAppointmentButton />
    </>
  );
}