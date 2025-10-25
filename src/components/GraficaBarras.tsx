"use client";

interface GraficaBarrasProps {
  data: Array<{ nombre: string; valor: number }>;
  titulo: string;
  color?: string;
}

export function GraficaBarras({ data, titulo, color = "bg-qoder-dark-accent-primary" }: GraficaBarrasProps) {
  // Encontrar el valor máximo para escalar las barras
  const maxValor = Math.max(...data.map(item => item.valor), 0);
  
  return (
    <div className="qoder-dark-card">
      <h3 className="font-semibold text-qoder-dark-text-primary mb-4">{titulo}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className="w-32 text-sm text-qoder-dark-text-secondary truncate" title={item.nombre}>
              {item.nombre}
            </div>
            <div className="flex-1 ml-2">
              <div className="flex items-center">
                <div 
                  className={`h-6 ${color} rounded-sm transition-all duration-500`}
                  style={{ 
                    width: maxValor > 0 ? `${(item.valor / maxValor) * 100}%` : '0%' 
                  }}
                />
                <div className="ml-2 text-sm text-qoder-dark-text-primary min-w-[40px]">
                  {item.valor}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}