"use client";

interface HeatmapHorariosProps {
  data: Record<string, number>;
  titulo: string;
}

export function HeatmapHorarios({ data, titulo }: HeatmapHorariosProps) {
  // Definir los días de la semana y horas del día
  const dias = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const horas = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
  
  // Encontrar el valor máximo para escalar los colores
  const maxValue = Math.max(...Object.values(data), 1);
  
  // Función para obtener el valor de un slot específico
  const getSlotValue = (dia: string, hora: string) => {
    const key = `${dia} ${hora}`;
    return data[key] || 0;
  };
  
  // Función para obtener el color basado en el valor
  const getColor = (value: number) => {
    if (value === 0) return "bg-qoder-dark-bg-secondary";
    
    const intensity = Math.min(1, value / maxValue);
    if (intensity > 0.8) return "bg-qoder-dark-accent-danger";
    if (intensity > 0.6) return "bg-qoder-dark-accent-warning";
    if (intensity > 0.4) return "bg-qoder-dark-accent-success";
    if (intensity > 0.2) return "bg-qoder-dark-accent-primary";
    return "bg-qoder-dark-accent-info";
  };

  return (
    <div className="qoder-dark-card">
      <h3 className="font-semibold text-qoder-dark-text-primary mb-4">{titulo}</h3>
      
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Encabezado con horas */}
          <div className="flex mb-2">
            <div className="w-12"></div>
            {horas.map((hora) => (
              <div key={hora} className="w-12 text-center text-xs text-qoder-dark-text-secondary">
                {hora}
              </div>
            ))}
          </div>
          
          {/* Filas por día */}
          {dias.map((dia) => (
            <div key={dia} className="flex items-center mb-1">
              <div className="w-12 text-xs text-qoder-dark-text-secondary">
                {dia}
              </div>
              {horas.map((hora) => {
                const value = getSlotValue(dia, hora);
                return (
                  <div
                    key={`${dia}-${hora}`}
                    className={`w-12 h-8 flex items-center justify-center text-xs ${getColor(value)} rounded-sm`}
                    title={`${dia} ${hora}: ${value} citas`}
                  >
                    {value > 0 ? value : ""}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 flex flex-wrap gap-2">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-qoder-dark-accent-info rounded-sm mr-1"></div>
          <span className="text-xs text-qoder-dark-text-secondary">Bajo</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-qoder-dark-accent-primary rounded-sm mr-1"></div>
          <span className="text-xs text-qoder-dark-text-secondary">Medio</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-qoder-dark-accent-success rounded-sm mr-1"></div>
          <span className="text-xs text-qoder-dark-text-secondary">Alto</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-qoder-dark-accent-warning rounded-sm mr-1"></div>
          <span className="text-xs text-qoder-dark-text-secondary">Muy alto</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-qoder-dark-accent-danger rounded-sm mr-1"></div>
          <span className="text-xs text-qoder-dark-text-secondary">Máximo</span>
        </div>
      </div>
    </div>
  );
}