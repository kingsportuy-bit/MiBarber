"use client";

interface GraficaTortaProps {
  data: Array<{ nombre: string; valor: number; color: string }>;
  titulo: string;
}

export function GraficaTorta({ data, titulo }: GraficaTortaProps) {
  // Calcular el total
  const total = data.reduce((sum, item) => sum + item.valor, 0);
  
  // Calcular porcentajes y ángulos
  const chartData = data.map(item => ({
    ...item,
    percentage: total > 0 ? (item.valor / total) * 100 : 0,
  }));
  
  // Crear segmentos de la torta
  let cumulativePercentage = 0;
  
  const segments = chartData.map((item, index) => {
    const startAngle = (cumulativePercentage / 100) * 360;
    cumulativePercentage += item.percentage;
    const endAngle = (cumulativePercentage / 100) * 360;
    
    // Convertir ángulos a coordenadas cartesianas
    const startX = 50 + 40 * Math.cos((Math.PI / 180) * (startAngle - 90));
    const startY = 50 + 40 * Math.sin((Math.PI / 180) * (startAngle - 90));
    const endX = 50 + 40 * Math.cos((Math.PI / 180) * (endAngle - 90));
    const endY = 50 + 40 * Math.sin((Math.PI / 180) * (endAngle - 90));
    
    // Determinar si el arco es mayor a 180 grados
    const largeArcFlag = item.percentage > 50 ? 1 : 0;
    
    // Crear el path para el segmento
    const pathData = `M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
    
    return {
      ...item,
      pathData,
      startAngle,
      endAngle
    };
  });
  
  return (
    <div className="qoder-dark-card">
      <h3 className="font-semibold text-qoder-dark-text-primary mb-4">{titulo}</h3>
      
      <div className="flex flex-col md:flex-row items-center">
        <div className="w-64 h-64 relative">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {segments.map((segment, index) => (
              <path
                key={index}
                d={segment.pathData}
                fill={segment.color}
                stroke="#1f2937"
                strokeWidth="0.5"
              />
            ))}
            
            {/* Círculo central para crear efecto de dona */}
            <circle cx="50" cy="50" r="15" fill="#1f2937" />
          </svg>
        </div>
        
        <div className="mt-4 md:mt-0 md:ml-6 flex-1">
          <div className="space-y-2">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-sm mr-2" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <div className="flex-1 text-sm text-qoder-dark-text-primary">
                  {item.nombre}
                </div>
                <div className="text-sm font-medium text-qoder-dark-text-primary">
                  {item.percentage.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-qoder-dark-border">
            <div className="text-sm text-qoder-dark-text-secondary">
              Total: <span className="font-medium text-qoder-dark-text-primary">{total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}