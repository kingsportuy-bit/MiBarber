'use client';

import { useState } from 'react';
import { ProductionReadyModal } from '@/components/ProductionReadyModal';

export default function TestProductionPage() {
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
        Prueba de Modal Listo para Producción
      </h1>
      
      <div style={{
        backgroundColor: '#1f1f1f',
        padding: '2rem',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
          Este modal está listo para reemplazar directamente los modales existentes en páginas antiguas.
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
          Abrir Modal Listo para Producción
        </button>
      </div>
      
      <ProductionReadyModal
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
          Características del Modal
        </h2>
        <ul style={{
          paddingLeft: '1.5rem',
          lineHeight: '1.6'
        }}>
          <li>Totalmente independiente de layouts V2</li>
          <li>Funciona en páginas antiguas sin modificaciones</li>
          <li>Validación de datos integrada</li>
          <li>Servicios y barberos predefinidos</li>
          <li>Actualización automática de precio y duración</li>
          <li>Estilos consistentes con el diseño V2</li>
        </ul>
      </div>
    </div>
  );
}