"use client";

interface GraficaFunnelProps {
  data: Array<{ etapa: string; valor: number }>;
  titulo: string;
}

export function GraficaFunnel({ data, titulo }: GraficaFunnelProps) {
  // Encontrar el valor máximo para escalar el embudo
  const maxValue = Math.max(...data.map(item => item.valor), 1);
  
  return (
    <div className="qoder-dark-card">
      <h3 className="font-semibold text-qoder-dark-text-primary mb-4">{titulo}</h3>
      
      <div className="space-y-2">
        {data.map((item, index) => {
          // Calcular el ancho basado en el valor
          const widthPercentage = (item.valor / maxValue) * 100;
          
          // Calcular el color basado en la posición en el embudo
          let bgColor = "bg-qoder-dark-accent-primary";
          if (index === 0) bgColor = "bg-qoder-dark-accent-info";
          if (index === data.length - 1) bgColor = "bg-qoder-dark-accent-success";
          
          return (
            <div key={index} className="relative">
              <div 
                className={`h-12 ${bgColor} rounded-lg flex items-center justify-center transition-all duration-300`}
                style={{ width: `${widthPercentage}%` }}
              >
                <div className="text-white font-medium text-sm">
                  {item.etapa}: {item.valor}
                </div>
              </div>
              
              {/* Etiqueta de etapa */}
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-full pr-2 text-right">
                <span className="text-xs text-qoder-dark-text-secondary whitespace-nowrap">
                  {item.etapa}
                </span>
              </div>
              
              {/* Porcentaje de conversión */}
              {index > 0 && (
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-full pl-2">
                  <span className="text-xs text-qoder-dark-text-secondary">
                    {((item.valor / data[index - 1].valor) * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 text-xs text-qoder-dark-text-secondary">
        <div className="flex justify-between">
          <span>Tasa de conversión total:</span>
          <span className="font-medium">
            {data.length > 1 ? ((data[data.length - 1].valor / data[0].valor) * 100).toFixed(1) : '0.0'}%
          </span>
        </div>
      </div>
    </div>
  );
}