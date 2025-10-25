"use client";

interface GraficaTortaProps {
  data: Array<{ nombre: string; valor: number; color: string }>;
  titulo: string;
}

export function GraficaTorta({ data, titulo }: GraficaTortaProps) {
  // Calcular el total
  const total = data.reduce((sum, item) => sum + item.valor, 0);
  
  if (total === 0) {
    return (
      <div className="qoder-dark-card">
        <h3 className="font-semibold text-qoder-dark-text-primary mb-4">{titulo}</h3>
        <div className="h-64 flex items-center justify-center text-qoder-dark-text-secondary">
          No hay datos para mostrar
        </div>
      </div>
    );
  }

  // Dimensiones
  const size = 200;
  const radius = size / 2 - 10;
  const centerX = size / 2;
  const centerY = size / 2;

  // Generar segmentos
  let acumulado = 0;
  const segmentos = data.map(item => {
    const porcentaje = item.valor / total;
    const inicioAngulo = acumulado * 2 * Math.PI;
    acumulado += porcentaje;
    const finAngulo = acumulado * 2 * Math.PI;
    
    // Coordenadas del arco
    const x1 = centerX + radius * Math.cos(inicioAngulo);
    const y1 = centerY + radius * Math.sin(inicioAngulo);
    const x2 = centerX + radius * Math.cos(finAngulo);
    const y2 = centerY + radius * Math.sin(finAngulo);
    
    // Determinar si es un arco grande
    const largeArcFlag = porcentaje > 0.5 ? 1 : 0;
    
    // Path para el segmento
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');
    
    return {
      ...item,
      porcentaje,
      pathData
    };
  });

  return (
    <div className="qoder-dark-card">
      <h3 className="font-semibold text-qoder-dark-text-primary mb-4">{titulo}</h3>
      <div className="flex flex-col md:flex-row items-center">
        <div className="relative">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {segmentos.map((segmento, index) => (
              <path
                key={index}
                d={segmento.pathData}
                fill={segmento.color}
                stroke="currentColor"
                strokeWidth="1"
                className="text-qoder-dark-bg-primary"
              />
            ))}
          </svg>
        </div>
        
        <div className="mt-4 md:mt-0 md:ml-6">
          {segmentos.map((segmento, index) => (
            <div key={index} className="flex items-center mb-2">
              <div 
                className="w-4 h-4 rounded-sm mr-2" 
                style={{ backgroundColor: segmento.color }}
              />
              <div className="text-sm text-qoder-dark-text-primary flex-1">
                {segmento.nombre}
              </div>
              <div className="text-sm text-qoder-dark-text-secondary ml-2">
                {segmento.valor} ({(segmento.porcentaje * 100).toFixed(1)}%)
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}