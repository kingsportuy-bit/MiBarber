"use client";

interface GraficaFunnelProps {
  data: Array<{ etapa: string; valor: number }>;
  titulo: string;
}

export function GraficaFunnel({ data, titulo }: GraficaFunnelProps) {
  // Encontrar el valor máximo para escalar el funnel
  const maxValue = Math.max(...data.map(item => item.valor), 1);
  
  // Colores para cada etapa
  const colores = [
    "bg-qoder-dark-accent-primary",
    "bg-qoder-dark-accent-secondary",
    "bg-qoder-dark-accent-success",
    "bg-qoder-dark-accent-warning",
    "bg-qoder-dark-accent-danger"
  ];

  return (
    <div className="qoder-dark-card">
      <h3 className="font-semibold text-qoder-dark-text-primary mb-4">{titulo}</h3>
      
      <div className="space-y-2">
        {data.map((item, index) => {
          // Calcular el ancho basado en el valor máximo
          const widthPercentage = (item.valor / maxValue) * 100;
          
          return (
            <div key={index} className="relative">
              <div 
                className={`h-12 ${colores[index % colores.length]} rounded transition-all duration-500 flex items-center justify-center relative overflow-hidden`}
                style={{ width: `${Math.max(30, widthPercentage)}%` }}
              >
                <div className="absolute inset-0 flex items-center justify-between px-4">
                  <span className="text-qoder-dark-text-primary font-medium text-sm">
                    {item.etapa}
                  </span>
                  <span className="text-qoder-dark-text-primary font-bold">
                    {item.valor}
                  </span>
                </div>
              </div>
              
              {index < data.length - 1 && (
                <div className="h-1 flex items-center justify-center">
                  <div className="w-4 h-4 border-r-2 border-b-2 border-qoder-dark-border-primary transform rotate-45"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 text-sm text-qoder-dark-text-secondary">
        <p>
          Tasa de conversión:{" "}
          {data.length > 1 
            ? `${((data[data.length - 1].valor / data[0].valor) * 100).toFixed(1)}%` 
            : "N/A"}
        </p>
      </div>
    </div>
  );
}