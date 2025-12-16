'use client';

import { useState } from 'react';
import { UltraSimpleAppointmentModal } from '@/components/UltraSimpleAppointmentModal';

export default function TestUltraSimplePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSave = async (data: any) => {
    console.log('Datos guardados:', data);
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto',
      backgroundColor: '#121212',
      minHeight: '100vh',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <h1 style={{
        fontSize: '2rem',
        fontWeight: 'bold',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        Prueba de Modal Ultra Simple
      </h1>
      
      <div style={{
        backgroundColor: '#1f1f1f',
        padding: '2rem',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
          Este modal ultra simple debería mostrarse correctamente incluso en páginas antiguas.
        </p>
        
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            backgroundColor: '#FF7700',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '4px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            boxShadow: '0 2px 4px rgba(255, 119, 0, 0.3)',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          Abrir Modal Ultra Simple
        </button>
      </div>
      
      <UltraSimpleAppointmentModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        initial={undefined}
        onSave={handleSave}
      />
      
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: '#1a2e40',
        border: '1px solid #2563eb',
        borderRadius: '4px'
      }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          marginBottom: '0.5rem',
          color: '#93c5fd'
        }}>
          ¿Por qué este modal funciona?
        </h2>
        <ul style={{
          paddingLeft: '1.5rem',
          lineHeight: '1.6'
        }}>
          <li>Usa estilos en línea para evitar conflictos con CSS existente</li>
          <li>Se monta directamente en el body con z-index alto</li>
          <li>No depende de layouts V2 ni estructuras complejas</li>
          <li>Tiene estilos similares a los modales V2 pero simplificados</li>
        </ul>
      </div>
    </div>
  );
}