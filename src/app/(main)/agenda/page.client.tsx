"use client";

import { useState, useEffect } from "react";
import Head from 'next/head';
import { usePageTitle } from "@/hooks/usePageTitle";
import { useCitas } from "@/hooks/useCitas";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
// import { SingleFormAppointmentModalWithSucursal } from "@/components/SingleFormAppointmentModalWithSucursal";
import { CalendarWithBloqueos } from "@/components/CalendarWithBloqueos";
import { GlobalFilters } from "@/components/shared/GlobalFilters";
import type { Appointment } from "@/types/db";
import { toast } from "sonner";
import { useGlobalFilters } from "@/hooks/useGlobalFilters";
import { getLocalDateString, getLocalDateTime } from "@/shared/utils/dateUtils";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { MobileAgenda } from "@/components/MobileAgenda";
import { EnhancedFinalAppointmentModal } from "@/components/EnhancedFinalAppointmentModal";
import { DesktopAgenda } from "@/components/DesktopAgenda";

export default function AgendaPageClient() {
  usePageTitle("Barberox | Agenda");

  const { idBarberia, barbero, isAdmin } = useBarberoAuth();
  const { filters } = useGlobalFilters();
  const isMobile = useIsMobile();

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

  // On mobile, use the new mobile agenda component
  if (isMobile) {
    return (
      <>
        <Head>
          <title>Barberox | Agenda</title>
        </Head>
        <MobileAgenda />
        {/* <SingleFormAppointmentModalWithSucursal
          open={isModalOpen}
          onOpenChange={handleCloseModal}
          initial={selectedAppointment || undefined}
        /> */}
        <EnhancedFinalAppointmentModal
          open={isModalOpen}
          onOpenChange={handleCloseModal}
          initial={selectedAppointment || undefined}
        />
      </>
    );
  }

  // On desktop, use the new desktop agenda component
  return (
    <>
      <Head>
        <title>Barberox | Agenda</title>
      </Head>
      <DesktopAgenda />
      {/* <SingleFormAppointmentModalWithSucursal
        open={isModalOpen}
        onOpenChange={handleCloseModal}
        initial={selectedAppointment || undefined}
      /> */}
      <EnhancedFinalAppointmentModal
        open={isModalOpen}
        onOpenChange={handleCloseModal}
        initial={selectedAppointment || undefined}
      />
    </>
  );
}
