"use client";

interface GraficaBarrasProps {
  data: Array<{ nombre: string; valor: number }>;
  titulo: string;
  color?: string;
}

export function GraficaBarras({ data, titulo, color = "bg-qoder-dark-accent-primary" }: GraficaBarrasProps) {
  // Encontrar el valor máximo para escalar las barras
  const maxValue = Math.max(...data.map(item => item.valor), 1);
  
  return (
    <div className="qoder-dark-card">
      <h3 className="font-semibold text-qoder-dark-text-primary mb-4">{titulo}</h3>
      
      <div className="space-y-3">
        {data.map((item, index) => {
          const barWidth = (item.valor / maxValue) * 100;
          return (
            <div key={index} className="flex items-center">
              <div className="w-32 text-sm text-qoder-dark-text-secondary truncate pr-2">
                {item.nombre}
              </div>
              <div className="flex-1 flex items-center">
                <div className="w-full bg-qoder-dark-bg-secondary rounded-full h-6">
                  <div 
                    className={`h-6 rounded-full flex items-center justify-end pr-2 ${color}`}
                    style={{ width: `${barWidth}%` }}
                  >
                    <span className="text-xs font-medium text-white">
                      {item.valor}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}