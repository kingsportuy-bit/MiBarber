"use client";

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export function FloatingNewAppointmentButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = () => {
    const event = new CustomEvent('openNewAppointmentModal');
    window.dispatchEvent(event);
  };

  const button = (
    <button
      onClick={handleClick}
      className="fixed bottom-20 right-6 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 z-[9999] flex items-center justify-center"
      aria-label="Nuevo turno"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
      </svg>
    </button>
  );

  if (!mounted) {
    return null;
  }
  
  return createPortal(button, document.body);
}