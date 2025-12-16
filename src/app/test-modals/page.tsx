'use client';

import { useState } from 'react';
import { LegacyPagesAppointmentModal } from '@/components/pages/LegacyPagesAppointmentModal';

export default function TestModalsPage() {
  const [isOldModalVisible, setIsOldModalVisible] = useState(false);
  const [isNewModalVisible, setIsNewModalVisible] = useState(false);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-white">Prueba de Modales</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-white">Modal Viejo (Problema)</h2>
          <p className="text-gray-300 mb-4">
            Este es el modal que actualmente tiene problemas de visibilidad en las páginas antiguas.
            Se muestra el overlay oscuro pero el contenido del modal no aparece.
          </p>
          <button 
            onClick={() => setIsOldModalVisible(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Mostrar Modal Viejo
          </button>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-white">Modal Nuevo (Solución)</h2>
          <p className="text-gray-300 mb-4">
            Este es el nuevo modal con estilos V2 que se muestra correctamente en páginas antiguas.
            Tiene fondo gris como los modales V2 y se muestra correctamente.
          </p>
          <button 
            onClick={() => setIsNewModalVisible(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Mostrar Modal Nuevo
          </button>
        </div>
      </div>
      
      {/* Modal viejo simulado (solo overlay) */}
      {isOldModalVisible && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setIsOldModalVisible(false)}
        >
          <div 
            className="hidden" // Aquí es donde falla el modal viejo - no se muestra
            style={{
              maxWidth: '600px',
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
              padding: '16px',
              width: '100%',
              maxHeight: '90vh',
              position: 'relative',
              zIndex: 1050,
              color: 'white'
            }}
          >
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
              <h3 className="text-xl font-bold">Modal Viejo (No Visible)</h3>
              <button 
                className="text-gray-400 hover:text-white text-2xl"
                onClick={() => setIsOldModalVisible(false)}
              >
                ×
              </button>
            </div>
            <div className="text-gray-300">
              Este contenido no se muestra porque el modal viejo tiene problemas de visibilidad.
            </div>
          </div>
        </div>
      )}
      
      {/* Modal nuevo */}
      <LegacyPagesAppointmentModal
        open={isNewModalVisible}
        onOpenChange={setIsNewModalVisible}
        initial={undefined}
      />
      
      <div className="mt-8 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-300 mb-2">Diferencias Visuales</h3>
        <ul className="text-blue-200 list-disc pl-5 space-y-1">
          <li><strong>Modal Viejo:</strong> Fondo negro con overlay oscuro, contenido no visible</li>
          <li><strong>Modal Nuevo:</strong> Fondo gris oscuro como V2, contenido completamente visible</li>
          <li><strong>Nuevo Modal:</strong> Sombra, transiciones suaves y estilos consistentes con V2</li>
        </ul>
      </div>
    </div>
  );
}