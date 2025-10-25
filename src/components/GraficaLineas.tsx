"use client";

interface GraficaLineasProps {
  data: Array<{ fecha: string; valor: number }>;
  titulo: string;
  color?: string;
}

export function GraficaLineas({ data, titulo, color = "text-qoder-dark-accent-primary" }: GraficaLineasProps) {
  if (data.length === 0) {
    return (
      <div className="qoder-dark-card">
        <h3 className="font-semibold text-qoder-dark-text-primary mb-4">{titulo}</h3>
        <div className="h-64 flex items-center justify-center text-qoder-dark-text-secondary">
          No hay datos para mostrar
        </div>
      </div>
    );
  }

  // Encontrar valores mínimos y máximos para escalar
  const valores = data.map(item => item.valor);
  const minValor = Math.min(...valores);
  const maxValor = Math.max(...valores);
  const rango = maxValor - minValor || 1; // Evitar división por cero

  // Dimensiones de la gráfica
  const width = 600;
  const height = 200;
  const padding = 40;

  // Convertir datos a puntos
  const puntos = data.map((item, index) => {
    const x = padding + (index * (width - 2 * padding) / (data.length - 1));
    const y = height - padding - ((item.valor - minValor) / rango) * (height - 2 * padding);
    return { x, y, ...item };
  });

  // Crear path para la línea
  let pathData = "";
  if (puntos.length > 0) {
    pathData = `M ${puntos[0].x},${puntos[0].y}`;
    for (let i = 1; i < puntos.length; i++) {
      pathData += ` L ${puntos[i].x},${puntos[i].y}`;
    }
  }

  return (
    <div className="qoder-dark-card">
      <h3 className="font-semibold text-qoder-dark-text-primary mb-4">{titulo}</h3>
      <div className="overflow-x-auto">
        <svg 
          width={width} 
          height={height} 
          viewBox={`0 0 ${width} ${height}`}
          className="min-w-full"
        >
          {/* Ejes */}
          <line 
            x1={padding} 
            y1={padding} 
            x2={padding} 
            y2={height - padding} 
            stroke="currentColor" 
            strokeOpacity="0.2" 
          />
          <line 
            x1={padding} 
            y1={height - padding} 
            x2={width - padding} 
            y2={height - padding} 
            stroke="currentColor" 
            strokeOpacity="0.2" 
          />

          {/* Línea de datos */}
          {pathData && (
            <path 
              d={pathData} 
              fill="none" 
              stroke={`currentColor`} 
              strokeWidth="2" 
              className={color}
            />
          )}

          {/* Puntos de datos */}
          {puntos.map((punto, index) => (
            <g key={index}>
              <circle 
                cx={punto.x} 
                cy={punto.y} 
                r="4" 
                fill="currentColor" 
                className={color}
              />
              <text 
                x={punto.x} 
                y={punto.y - 10} 
                textAnchor="middle" 
                fill="currentColor" 
                className="text-xs"
              >
                {punto.valor}
              </text>
              <text 
                x={punto.x} 
                y={height - 10} 
                textAnchor="middle" 
                fill="currentColor" 
                className="text-xs"
              >
                {punto.fecha.split('-')[2]} {/* Solo el día */}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}