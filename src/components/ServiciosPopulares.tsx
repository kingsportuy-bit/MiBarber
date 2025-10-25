"use client";

interface ServicioPopular {
  servicio: string;
  cantidad: number;
}

interface ServiciosPopularesProps {
  servicios: ServicioPopular[];
}

export function ServiciosPopulares({ servicios }: ServiciosPopularesProps) {
  return (
    <div className="qoder-dark-card">
      <h3 className="font-semibold text-qoder-dark-text-primary mb-4">Servicios Más Pedidos (Semana)</h3>
      {servicios.length === 0 ? (
        <div className="text-qoder-dark-text-secondary text-center py-4">
          No hay datos disponibles
        </div>
      ) : (
        <div className="space-y-3">
          {servicios.map((servicio, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-qoder-dark-bg-secondary flex items-center justify-center mr-3">
                  <span className="text-qoder-dark-text-primary font-semibold">{index + 1}</span>
                </div>
                <div className="text-qoder-dark-text-primary">
                  {servicio.servicio}
                </div>
              </div>
              <div className="bg-qoder-dark-bg-secondary text-qoder-dark-text-primary px-2 py-1 rounded text-sm">
                {servicio.cantidad} citas
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}