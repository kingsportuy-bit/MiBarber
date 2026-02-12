"use client";

import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { useWhatsAppStatus } from "@/hooks/useWhatsAppStatus";
import { useRouter } from "next/navigation";

export function WhatsAppNotification() {
    const { barbero, isAdmin } = useBarberoAuth();
    const router = useRouter();

    // Obtener ID de sucursal del barbero actual
    // Usamos el ID asignado al usuario, sea admin o no
    const sucursalId = barbero?.id_sucursal || undefined;

    const { wppActivo } = useWhatsAppStatus(sucursalId);

    if (!sucursalId || wppActivo !== "Desconectado") {
        return null;
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-[#1e1f20] border border-red-500/50 rounded-lg shadow-lg p-4 max-w-sm flex items-start gap-3">
                <div className="mt-0.5 text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="flex-1">
                    <h3 className="text-white font-medium mb-1">WhatsApp Desconectado</h3>
                    <p className="text-qoder-dark-text-secondary text-sm mb-3">
                        El servicio de mensajería no está activo. Reconectalo para continuar enviando mensajes.
                    </p>
                    <button
                        onClick={() => router.push('/whatsapp')}
                        className="text-sm font-medium text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded transition-colors"
                    >
                        Ir a conectar
                    </button>
                </div>
            </div>
        </div>
    );
}
