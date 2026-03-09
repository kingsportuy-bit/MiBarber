"use client";

import { useState } from "react";

interface ResponsiveNewAppointmentButtonProps {
  onCreate: () => void;
  className?: string;
}

export function ResponsiveNewAppointmentButton({ onCreate, className }: ResponsiveNewAppointmentButtonProps) {
  return (
    <div className="fixed bottom-4 right-4 md:static md:mb-6">
      <button
        onClick={onCreate}
        className={`
        flex items-center justify-center gap-2
        bg-[var(--color-primary)] text-black 
        px-3 md:px-5 py-2.5 md:py-3 
        rounded-none font-bold shadow-[0_4px_15px_rgba(197,160,89,0.2)] 
        hover:shadow-[0_6px_20px_rgba(197,160,89,0.3)] hover:-translate-y-0.5 
        transition-all duration-300 z-50 uppercase tracking-widest text-xs
        ${className || ''}
      `}
        style={{ fontFamily: 'var(--font-rasputin), serif' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span className="md:inline hidden">Nuevo Turno</span>
      </button>
    </div>
  );
}