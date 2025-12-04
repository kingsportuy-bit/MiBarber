'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabContent } from '@/components/ui/Tabs';

export default function PlantillaPage() {
  const [activeTab, setActiveTab] = useState('principal');

  const tabs = [
    { id: 'principal', label: 'Principal' },
    { id: 'secundaria', label: 'Secundaria' }
  ];

  const handleAction = () => {
    console.log('Acción ejecutada');
  };

  return (
    <>
      {/* Card principal con botón de acción */}
      <Card className="mb-8">
        <div className="flex justify-between items-center p-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-[var(--text-primary)] text-left">
            Card principal
          </h1>
          <Button 
            variant="primary" 
            onClick={handleAction}
            className="w-auto uppercase text-sm font-semibold px-6"
          >
            (acción)
          </Button>
        </div>
      </Card>

      {/* Pestañas */}
      <div className="mb-6">
        <Tabs
          tabs={tabs}
          defaultTab="principal"
          onValueChange={setActiveTab}
        />
      </div>

      {/* Contenido de las pestañas */}
      <TabContent value="principal" activeTab={activeTab}>
        {/* Primera fila: 4 tarjetas pequeñas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {[1, 2, 3, 4].map((num) => (
            <Card key={num} className="v2-card-small">
              <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)]">
                <p className="font-semibold">Tarjeta {num}</p>
                <p className="text-xs mt-2">Contenido de prueba</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Segunda fila: 3 tarjetas grandes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[5, 6, 7].map((num) => (
            <Card key={num} className="v2-card-large">
              <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)]">
                <p className="font-semibold">Tarjeta {num}</p>
                <p className="text-xs mt-2">Contenido de prueba</p>
              </div>
            </Card>
          ))}
        </div>
      </TabContent>

      {/* Contenido de la pestaña Secundaria */}
      <TabContent value="secundaria" activeTab={activeTab}>
        <Card className="v2-card-large">
          <p className="text-[var(--text-muted)] text-lg">Próximamente</p>
        </Card>
      </TabContent>
    </>
  );
}