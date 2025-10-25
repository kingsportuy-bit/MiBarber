"use client";

import { useState } from "react";

interface ResponsiveNewAppointmentButtonProps {
  onCreate: () => void;
}

export function ResponsiveNewAppointmentButton({ onCreate }: ResponsiveNewAppointmentButtonProps) {
  return (
    <div className="fixed bottom-4 right-4 md:static md:mb-6">
      <button 
        onClick={onCreate}
        className="qoder-dark-button-primary px-4 py-3 rounded-full md:rounded-lg flex items-center gap-2 hover-lift smooth-transition shadow-lg md:shadow-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span className="md:inline hidden">Nuevo Turno</span>
      </button>
    </div>
  );
}