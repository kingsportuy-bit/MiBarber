"use client";

interface GraficaLineasProps {
  data: Array<{ fecha: string; valor: number }>;
  titulo: string;
  color?: string;
}

export function GraficaLineas({ data, titulo, color = "text-qoder-dark-accent-primary" }: GraficaLineasProps) {
  // Encontrar valores mínimo y máximo para escalar la gráfica
  const values = data.map(item => item.valor);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1; // Evitar división por cero
  
  // Calcular puntos para la línea
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((item.valor - minValue) / range) * 100;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <div className="qoder-dark-card">
      <h3 className="font-semibold text-qoder-dark-text-primary mb-4">{titulo}</h3>
      
      <div className="h-64">
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          {/* Grid */}
          <defs>
            <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
              <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          
          {/* Línea de la gráfica */}
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            points={points}
            className={color}
          />
          
          {/* Puntos de datos */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - ((item.valor - minValue) / range) * 100;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="1.5"
                fill="currentColor"
                className={color}
              />
            );
          })}
        </svg>
        
        {/* Etiquetas de fechas */}
        <div className="flex justify-between mt-2">
          {data.map((item, index) => (
            <div 
              key={index} 
              className="text-xs text-qoder-dark-text-secondary"
              style={{ width: `${100 / data.length}%` }}
            >
              {item.fecha}
            </div>
          ))}
        </div>
      </div>
      
      {/* Leyenda de valores */}
      <div className="flex justify-between mt-4 text-xs">
        <span className="text-qoder-dark-text-secondary">
          Mín: ${minValue.toFixed(2)}
        </span>
        <span className="text-qoder-dark-text-secondary">
          Máx: ${maxValue.toFixed(2)}
        </span>
      </div>
    </div>
  );
}