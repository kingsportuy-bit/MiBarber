"use client";

import { useState, useRef } from "react";
import { usePDF } from "react-to-pdf";
import type { AdminEstadisticas } from "@/hooks/useEstadisticas";

interface ExportarEstadisticasCompletoProps {
  data: AdminEstadisticas;
  filename: string;
  activeTab: "sucursales" | "barberos" | "clientes";
}

export function ExportarEstadisticasCompleto({ data, filename, activeTab }: ExportarEstadisticasCompletoProps) {
  const [isExporting, setIsExporting] = useState(false);
  const componentRef = useRef(null);
  
  // Configuración para la exportación a PDF
  const { toPDF, targetRef } = usePDF({
    filename: `${filename}-completo.pdf`
  });
  
  const exportToPDF = () => {
    setIsExporting(true);
    // Iniciar la exportación a PDF
    toPDF();
    setIsExporting(false);
  };
  
  // Preparar datos para mostrar en el PDF
  const ingresosPorSucursalData = Object.entries(data.ingresosPorSucursal)
    .map(([nombre, valor]) => ({ nombre, valor }))
    .sort((a, b) => b.valor - a.valor);
    
  const ingresosPorBarberoData = Object.entries(data.ingresosPorBarbero)
    .map(([nombre, valor]) => ({ nombre, valor }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5);
    
  const ingresosPorServicioData = Object.entries(data.ingresosPorServicio)
    .map(([nombre, valor]) => ({ nombre, valor }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5);
    
  const turnosPorHoraData = Object.entries(data.turnosPorHora)
    .map(([nombre, valor]) => ({ nombre, valor }))
    .sort((a, b) => b.valor - a.valor);
    
  const productividadBarberoData = Object.entries(data.productividadBarbero)
    .map(([nombre, valor]) => ({ nombre, valor }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5);

  return (
    <div className="flex gap-2">
      <button
        onClick={exportToPDF}
        disabled={isExporting}
        className="qoder-dark-button-secondary px-3 py-2 rounded-lg text-sm flex items-center gap-2"
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></div>
            Exportando...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exportar PDF
          </>
        )}
      </button>
      
      {/* Elemento oculto para la exportación a PDF */}
      <div ref={targetRef} className="hidden">
        <div className="p-8 bg-white text-black">
          <h1 className="text-2xl font-bold mb-6">Reporte de Estadísticas - {filename}</h1>
          
          {activeTab === "sucursales" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Estadísticas de Sucursales</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="border p-4 rounded">
                  <h3 className="font-medium">Ingresos Totales</h3>
                  <p className="text-2xl font-bold">${data.ingresosTotales.toFixed(2)}</p>
                </div>
                
                <div className="border p-4 rounded">
                  <h3 className="font-medium">Tasa de Ocupación</h3>
                  <p className="text-2xl font-bold">{data.tasaOcupacion}%</p>
                </div>
                
                <div className="border p-4 rounded">
                  <h3 className="font-medium">Tasa de Cancelación</h3>
                  <p className="text-2xl font-bold">{data.tasaCancelacion}%</p>
                </div>
                
                <div className="border p-4 rounded">
                  <h3 className="font-medium">Frecuencia de Visitas</h3>
                  <p className="text-2xl font-bold">{data.frecuenciaVisitas}</p>
                </div>
              </div>
              
              <div className="border p-4 rounded">
                <h3 className="font-medium mb-2">Ingresos por Sucursal</h3>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left">Sucursal</th>
                      <th className="text-right">Ingresos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingresosPorSucursalData.map((item, index) => (
                      <tr key={index}>
                        <td>{item.nombre}</td>
                        <td className="text-right">${item.valor.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="border p-4 rounded">
                <h3 className="font-medium mb-2">Ingresos por Tipo de Servicio</h3>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left">Servicio</th>
                      <th className="text-right">Ingresos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingresosPorServicioData.map((item, index) => (
                      <tr key={index}>
                        <td>{item.nombre}</td>
                        <td className="text-right">${item.valor.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="border p-4 rounded">
                <h3 className="font-medium mb-2">Turnos por Hora</h3>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left">Hora</th>
                      <th className="text-right">Turnos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {turnosPorHoraData.map((item, index) => (
                      <tr key={index}>
                        <td>{item.nombre}</td>
                        <td className="text-right">{item.valor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === "barberos" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Estadísticas de Barberos</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="border p-4 rounded">
                  <h3 className="font-medium">Ingresos Totales</h3>
                  <p className="text-2xl font-bold">${data.ingresosTotales.toFixed(2)}</p>
                </div>
                
                <div className="border p-4 rounded">
                  <h3 className="font-medium">Tasa de Ocupación</h3>
                  <p className="text-2xl font-bold">{data.tasaOcupacion}%</p>
                </div>
                
                <div className="border p-4 rounded">
                  <h3 className="font-medium">Tasa de Cancelación</h3>
                  <p className="text-2xl font-bold">{data.tasaCancelacion}%</p>
                </div>
                
                <div className="border p-4 rounded">
                  <h3 className="font-medium">Frecuencia de Visitas</h3>
                  <p className="text-2xl font-bold">{data.frecuenciaVisitas}</p>
                </div>
              </div>
              
              <div className="border p-4 rounded">
                <h3 className="font-medium mb-2">Ingresos por Barbero</h3>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left">Barbero</th>
                      <th className="text-right">Ingresos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingresosPorBarberoData.map((item, index) => (
                      <tr key={index}>
                        <td>{item.nombre}</td>
                        <td className="text-right">${item.valor.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="border p-4 rounded">
                <h3 className="font-medium mb-2">Productividad por Barbero</h3>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left">Barbero</th>
                      <th className="text-right">Productividad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productividadBarberoData.map((item, index) => (
                      <tr key={index}>
                        <td>{item.nombre}</td>
                        <td className="text-right">{item.valor.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === "clientes" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Estadísticas de Clientes</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="border p-4 rounded">
                  <h3 className="font-medium">Valor de Cliente</h3>
                  <p className="text-2xl font-bold">${data.valorCliente.toFixed(2)}</p>
                </div>
                
                <div className="border p-4 rounded">
                  <h3 className="font-medium">Frecuencia de Visitas</h3>
                  <p className="text-2xl font-bold">{data.frecuenciaVisitas}</p>
                </div>
              </div>
              
              <div className="border p-4 rounded">
                <h3 className="font-medium mb-2">Distribución de Clientes</h3>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left">Categoría</th>
                      <th className="text-right">Clientes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.distribucionClientes).map(([nombre, valor], index) => (
                      <tr key={index}>
                        <td>{nombre}</td>
                        <td className="text-right">{valor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <div className="mt-8 text-sm text-gray-500">
            <p>Reporte generado el {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}