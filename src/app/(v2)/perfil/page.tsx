'use client';

import React, { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useBarberoCompleto } from '@/features/perfil/hooks/useBarberoCompleto';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Tabs, TabContent } from '@/components/ui/Tabs';
import { useCurrentDate } from '@/components/shared/CurrentDateProvider';

// ⭐ NUEVAS IMPORTACIONES
import { EstadisticasCards } from '@/features/perfil/components/EstadisticasCards';
import { ServiciosSection } from '@/features/perfil/components/ServiciosSection';
import { ClientesSection } from '@/features/perfil/components/ClientesSection';
import { BloqueosTable } from '@/features/perfil/components/BloqueosTable';
import { DescansosList } from '@/features/perfil/components/DescansosList';
import { EditarPerfilModal } from '@/features/perfil/components/EditarPerfilModal';

export default function PerfilPage() {
  const { barbero: barberoAuth, idBarberia } = useAuth();
  const { data: barberoCompleto, isLoading: isLoadingBarbero } = useBarberoCompleto(barberoAuth?.id_barbero || null);
  const [activeTab, setActiveTab] = useState('perfil');
  const [showEditModal, setShowEditModal] = useState(false);

  // Usar los datos completos del barbero si están disponibles, de lo contrario usar los de auth o mock
  const barberoData = barberoCompleto || barberoAuth || {
    id_barbero: 'mock-id',
    nombre: 'Agustin Blanco',
    email: 'agustinblanco.1605@hotmail.com',
    telefono: 'No especificado',
    username: 'agustin.blanco',
    nivel_permisos: 2,
    admin: false,
    id_barberia: idBarberia || 'mock-barberia-id',
    id_sucursal: null,
    especialidades: ['Corte de cabello', 'Barba'],
    activo: true,
    password_hash: null,
    conf_inicial: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const tabs = [
    { id: 'perfil', label: 'Perfil' },
    { id: 'horarios', label: 'Horarios' }
  ];

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  return (
    <>
      {/* ⭐ MANTENER Card principal existente - NO MODIFICAR */}
      <Card className="mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 p-4 md:p-6">
          <div className="flex-shrink-0">
            <Avatar 
              src={(barberoCompleto || barberoAuth) ? (barberoCompleto || barberoAuth as any).foto || undefined : undefined}
              alt={barberoData.nombre}
              size="xl"
              className="w-20 h-20 md:w-24 md:h-24"
            />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 
              className="text-center text-3xl md:text-4xl mb-2 text-[var(--text-primary)] client-name"
              style={
                {
                  fontFamily: "'Old English Text MT', 'Roboto', 'Arial', sans-serif",
                  fontSize: '1.8rem',
                  textShadow: 'none',
                  background: 'none',
                  backgroundImage: 'none',
                  WebkitTextFillColor: 'inherit',
                  fontWeight: 'normal'
                }
              }
            >
              {barberoData.nombre}
            </h1>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              @{barberoData.username || 'Sin usuario'}
            </p>
            
            <div className="space-y-3">
              <div>
                <p className="text-xs uppercase text-[var(--text-muted)] mb-1 font-semibold">
                  EMAIL
                </p>
                <p className="text-sm md:text-base text-[var(--text-secondary)]">
                  {barberoData.email || 'No especificado'}
                </p>
              </div>
              
              <div>
                <p className="text-xs uppercase text-[var(--text-muted)] mb-1 font-semibold">
                  TELÉFONO
                </p>
                <p className="text-sm md:text-base text-[var(--text-secondary)]">
                  {barberoData.telefono || 'No especificado'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 w-full md:w-auto">
            <Button 
              variant="primary" 
              onClick={handleEditProfile}
              className="w-full md:w-auto uppercase text-sm font-semibold px-6"
            >
              Editar perfil
            </Button>
          </div>
        </div>
      </Card>

      {/* ⭐ MANTENER Pestañas - NO MODIFICAR */}
      <div className="mb-6">
        <Tabs
          tabs={tabs}
          defaultTab="perfil"
          onValueChange={setActiveTab}
          className="v2-tabs-selector"
        />
      </div>

      {/* ⭐ ACTUALIZAR: Contenido de la pestaña Perfil */}
      <TabContent value="perfil" activeTab={activeTab}>
        {barberoAuth && idBarberia && (
          <>
            <EstadisticasCards 
              barberoId={barberoAuth.id_barbero} 
              barberiaId={idBarberia} 
            />
            
            <ServiciosSection 
              barberoId={barberoAuth.id_barbero} 
              barberiaId={idBarberia} 
            />
            
            <ClientesSection 
              barberoId={barberoAuth.id_barbero} 
              barberiaId={idBarberia} 
            />
          </>
        )}
      </TabContent>

      {/* ⭐ ACTUALIZAR: Contenido de la pestaña Horarios */}
      <TabContent value="horarios" activeTab={activeTab}>
        {barberoAuth && idBarberia && barberoAuth.id_sucursal && (
          <>
            <BloqueosTable 
              barberoId={barberoAuth.id_barbero} 
              barberiaId={idBarberia}
              sucursalId={barberoAuth.id_sucursal}
            />
            
            <DescansosList 
              barberoId={barberoAuth.id_barbero} 
              barberiaId={idBarberia}
              sucursalId={barberoAuth.id_sucursal}
            />
          </>
        )}
      </TabContent>

      {/* Modal de editar perfil */}
      {showEditModal && barberoAuth && (
        <EditarPerfilModal
          barbero={barberoAuth}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}
