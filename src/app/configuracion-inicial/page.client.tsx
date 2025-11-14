"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useBarberiaInfo } from "@/hooks/useBarberiaInfo";
import { HorariosSucursalForm } from "@/components/HorariosSucursalForm";
import { SucursalBarberosSection } from "@/components/SucursalBarberosSection";
import { SucursalServiciosSection } from "@/components/SucursalServiciosSection";
import { CrearBarberoModal } from "@/components/CrearBarberoModal";
import { NuevaSucursalForm } from "@/components/NuevaSucursalForm";

export default function ConfiguracionInicialPageClient() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const { 
    barberiaInfoQuery,
    sucursalesQuery,
    serviciosQuery,
    createSucursalMutation,
    createServiceMutation,
    updateServiceMutation,
    deleteServiceMutation
  } = useBarberiaInfo();
  
  const isLoading = barberiaInfoQuery.isLoading || sucursalesQuery.isLoading || serviciosQuery.isLoading;
  const idBarberia = barberiaInfoQuery.data?.id;
  const sucursales = sucursalesQuery.data || [];
  const sucursalActual = sucursales.length > 0 ? sucursales[0] : null;
  const idSucursal = sucursalActual?.id;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showDescansos, setShowDescansos] = useState(false);
  const [showBarberos, setShowBarberos] = useState(false);
  const [showSucursales, setShowSucursales] = useState(false);

  // Verificar si ya se completó la configuración
  useEffect(() => {
    const checkConfiguracionCompleta = async () => {
      if (!idBarberia || !idSucursal) return;
      
      // Verificar si ya se completó la configuración
      const { data, error } = await supabase
        .from('mibarber_configuracion_inicial')
        .select('completada')
        .eq('id_barberia', idBarberia)
        .single();
      
      if (data?.completada) {
        router.push("/inicio");
      }
    };
    
    checkConfiguracionCompleta();
  }, [idBarberia, idSucursal, router, supabase]);

  const markStepAsCompleted = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step]);
    }
  };

  const handleHorariosCompletados = () => {
    markStepAsCompleted(1);
    setCurrentStep(2);
  };

  const handleDescansosCompletados = () => {
    setShowDescansos(false);
  };

  const handleBarberosCompletados = () => {
    setShowBarberos(false);
  };

  const handleSucursalesCompletados = () => {
    setShowSucursales(false);
  };

  const finalizarConfiguracion = async () => {
    if (!idBarberia) return;
    
    try {
      // Marcar configuración como completada
      const { error } = await supabase
        .from('mibarber_configuracion_inicial')
        .upsert({
          id_barberia: idBarberia,
          completada: true,
          fecha_completada: new Date().toISOString()
        });
      
      if (error) throw error;
      
      router.push("/inicio");
    } catch (error) {
      console.error("Error al finalizar configuración:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-qoder-dark-accent-primary mx-auto mb-4"></div>
          <p className="text-qoder-dark-text-secondary">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-qoder-dark-text-primary mb-2">
            Configuración Inicial
          </h1>
          <p className="text-qoder-dark-text-secondary">
            ¡Bienvenido! Vamos a configurar tu sistema paso a paso
          </p>
        </div>

        {/* Indicador de progreso */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className={`flex-1 text-center ${currentStep >= 1 ? 'text-qoder-dark-accent-primary' : 'text-qoder-dark-text-secondary'}`}>
              <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${currentStep >= 1 || completedSteps.includes(1) ? 'bg-qoder-dark-accent-primary' : 'bg-qoder-dark-bg-secondary'}`}>
                {completedSteps.includes(1) ? '✓' : '1'}
              </div>
              <span className="text-sm">Horarios</span>
            </div>
            <div className="flex-1 h-1 bg-qoder-dark-bg-secondary"></div>
            <div className={`flex-1 text-center ${currentStep >= 2 ? 'text-qoder-dark-accent-primary' : 'text-qoder-dark-text-secondary'}`}>
              <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${currentStep >= 2 || completedSteps.includes(2) ? 'bg-qoder-dark-accent-primary' : 'bg-qoder-dark-bg-secondary'}`}>
                {completedSteps.includes(2) ? '✓' : '2'}
              </div>
              <span className="text-sm">Servicios</span>
            </div>
            <div className="flex-1 h-1 bg-qoder-dark-bg-secondary"></div>
            <div className={`flex-1 text-center ${currentStep >= 3 ? 'text-qoder-dark-accent-primary' : 'text-qoder-dark-text-secondary'}`}>
              <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${currentStep >= 3 || completedSteps.includes(3) ? 'bg-qoder-dark-accent-primary' : 'bg-qoder-dark-bg-secondary'}`}>
                {completedSteps.includes(3) ? '✓' : '3'}
              </div>
              <span className="text-sm">Finalizar</span>
            </div>
          </div>
        </div>

        {/* Paso 1: Configuración de Horarios */}
        {currentStep === 1 && (
          <div className="bg-qoder-dark-bg-primary rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-qoder-dark-text-primary mb-4">
              Configurar Horarios de la Sucursal
            </h2>
            <p className="text-qoder-dark-text-secondary mb-6">
              Establece los horarios de atención para tu sucursal. Puedes agregar descansos adicionales si es necesario.
            </p>
            
            {sucursalActual?.id && (
              <div className="mb-6 bg-qoder-dark-bg-secondary p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-qoder-dark-text-primary mb-3">
                  Horarios de la Sucursal
                </h3>
                <p className="text-qoder-dark-text-secondary mb-4">
                  Configura los horarios de atención para tu sucursal.
                </p>
                <div className="text-center py-8">
                  <button
                    onClick={handleHorariosCompletados}
                    className="qoder-dark-button-primary px-6 py-3 rounded-lg"
                  >
                    Configurar Horarios
                  </button>
                </div>
              </div>
            )}
            
            <div className="flex flex-wrap gap-4 mt-6">
              <button
                onClick={() => setShowDescansos(true)}
                className="qoder-dark-button px-4 py-2 rounded-lg"
              >
                + Agregar Descansos Extra
              </button>
            </div>
          </div>
        )}

        {/* Paso 2: Configuración de Servicios */}
        {currentStep === 2 && (
          <div className="bg-qoder-dark-bg-primary rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-qoder-dark-text-primary mb-4">
              Configurar Servicios
            </h2>
            <p className="text-qoder-dark-text-secondary mb-6">
              Agrega los servicios que ofrece tu barbería. Puedes editarlos o eliminarlos más tarde.
            </p>
            
            <div className="text-qoder-dark-text-primary">
              <p>Configuración de servicios no disponible en esta sección.</p>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setCurrentStep(3)}
                className="qoder-dark-button-primary px-6 py-2 rounded-lg"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Paso 3: Configuración Adicional y Finalización */}
        {currentStep === 3 && (
          <div className="bg-qoder-dark-bg-primary rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-qoder-dark-text-primary mb-4">
              Configuración Adicional (Opcional)
            </h2>
            <p className="text-qoder-dark-text-secondary mb-6">
              Puedes agregar más barberos o sucursales si es necesario. Cuando termines, haz clic en "Finalizar Configuración".
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-qoder-dark-bg-secondary p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-qoder-dark-text-primary mb-3">
                  Agregar Más Barberos
                </h3>
                <button
                  onClick={() => setShowBarberos(true)}
                  className="qoder-dark-button w-full py-2 rounded-lg"
                >
                  + Agregar Barbero
                </button>
              </div>
              
              <div className="bg-qoder-dark-bg-secondary p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-qoder-dark-text-primary mb-3">
                  Agregar Más Sucursales
                </h3>
                <button
                  onClick={() => setShowSucursales(true)}
                  className="qoder-dark-button w-full py-2 rounded-lg"
                >
                  + Agregar Sucursal
                </button>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={finalizarConfiguracion}
                className="qoder-dark-button-primary px-6 py-2 rounded-lg"
              >
                Finalizar Configuración
              </button>
            </div>
          </div>
        )}

        {/* Modal para Descansos Extra */}
        {showDescansos && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-qoder-dark-bg-primary rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-qoder-dark-text-primary">
                  Configurar Descansos Extra
                </h3>
                <button
                  onClick={() => setShowDescansos(false)}
                  className="text-qoder-dark-text-secondary hover:text-qoder-dark-text-primary"
                >
                  ✕
                </button>
              </div>
              <div className="text-qoder-dark-text-primary">
                <p>Configuración de descansos extra no disponible en esta versión.</p>
              </div>
            </div>
          </div>
        )}

        {/* Modal para Agregar Barberos */}
        {showBarberos && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-qoder-dark-bg-primary rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-qoder-dark-text-primary">
                  Agregar Nuevo Barbero
                </h3>
                <button
                  onClick={() => setShowBarberos(false)}
                  className="text-qoder-dark-text-secondary hover:text-qoder-dark-text-primary"
                >
                  ✕
                </button>
              </div>
              <div className="text-qoder-dark-text-primary">
                <p>Formulario para agregar barberos no disponible en esta sección.</p>
              </div>
            </div>
          </div>
        )}

        {/* Modal para Agregar Sucursales */}
        {showSucursales && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-qoder-dark-bg-primary rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-qoder-dark-text-primary">
                  Agregar Nueva Sucursal
                </h3>
                <button
                  onClick={() => setShowSucursales(false)}
                  className="text-qoder-dark-text-secondary hover:text-qoder-dark-text-primary"
                >
                  ✕
                </button>
              </div>
              <NuevaSucursalForm 
                idBarberia={idBarberia || ''} 
                onCancel={() => setShowSucursales(false)}
                onSucursalCreada={handleSucursalesCompletados}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}