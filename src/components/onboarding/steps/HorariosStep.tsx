import { OnboardingData } from "../OnboardingWizard";
import { useState } from "react";
import { SunIcon, MoonIcon, ClockIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

interface HorariosStepProps {
    data: OnboardingData;
    updateData: (key: keyof OnboardingData, value: any) => void;
    onNext: () => void;
    onBack: () => void;
}

const DAYS = [
    { id: 1, name: "Lunes", short: "L" },
    { id: 2, name: "Martes", short: "M" },
    { id: 3, name: "Miércoles", short: "X" },
    { id: 4, name: "Jueves", short: "J" },
    { id: 5, name: "Viernes", short: "V" },
    { id: 6, name: "Sábado", short: "S" },
    { id: 7, name: "Domingo", short: "D" },
];

export default function HorariosStep({ data, updateData, onNext, onBack }: HorariosStepProps) {
    // Initialize hours if empty
    const [localHorarios, setLocalHorarios] = useState<any[]>(() => {
        if (data.sucursal.horarios && data.sucursal.horarios.length > 0) {
            return data.sucursal.horarios;
        }
        return DAYS.map(d => ({
            id_dia: d.id,
            activo: d.id <= 5, // Default Mon-Fri
            hora_apertura: "09:00",
            hora_cierre: "19:00",
            hora_inicio_almuerzo: "",
            hora_fin_almuerzo: ""
        }));
    });

    const [selectedDayId, setSelectedDayId] = useState<number>(1);
    const selectedDay = localHorarios.find(h => h.id_dia === selectedDayId);
    const selectedDayName = DAYS.find(d => d.id === selectedDayId)?.name;

    const updateDay = (field: string, value: any) => {
        const updated = localHorarios.map(h =>
            h.id_dia === selectedDayId ? { ...h, [field]: value } : h
        );
        setLocalHorarios(updated);
        updateData("sucursal", { ...data.sucursal, horarios: updated });
    };

    const copyToAllWeekdays = () => {
        if (!selectedDay) return;
        const updated = localHorarios.map(h => {
            if (h.id_dia <= 5) {
                return {
                    ...h,
                    activo: true, // Force active if copying
                    hora_apertura: selectedDay.hora_apertura,
                    hora_cierre: selectedDay.hora_cierre,
                    hora_inicio_almuerzo: selectedDay.hora_inicio_almuerzo,
                    hora_fin_almuerzo: selectedDay.hora_fin_almuerzo,
                };
            }
            return h;
        });
        setLocalHorarios(updated);
        updateData("sucursal", { ...data.sucursal, horarios: updated });
    };

    const inputFocus = { scale: 1.02, borderColor: "#a855f7", boxShadow: "0 0 0 2px rgba(168, 85, 247, 0.4)" };

    return (
        <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <ClockIcon className="w-6 h-6 text-cyan-400" />
                        Configuración de Horarios
                    </h2>
                    <p className="text-slate-400">
                        Define la disponibilidad de tu sucursal.
                    </p>
                </div>
                {/* AI Assistant Bubble */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="hidden md:flex items-center gap-3 bg-violet-900/30 border border-violet-500/30 px-4 py-2 rounded-full backdrop-blur-md shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                >
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>
                    <span className="text-xs text-violet-200 font-medium">AI: "Puedo copiar este horario a toda la semana."</span>
                </motion.div>
            </div>

            {/* Futuristic Day Selector */}
            <div className="flex justify-between gap-3 overflow-x-auto pb-4 custom-scrollbar">
                {DAYS.map(day => {
                    const dayConfig = localHorarios.find(h => h.id_dia === day.id);
                    const isActive = dayConfig?.activo;
                    const isSelected = selectedDayId === day.id;

                    return (
                        <motion.button
                            key={day.id}
                            onClick={() => setSelectedDayId(day.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`
                                relative flex flex-col items-center justify-center w-14 h-20 rounded-2xl border transition-all duration-300 group
                                ${isSelected
                                    ? 'bg-gradient-to-br from-violet-600 to-indigo-600 border-white/20 shadow-lg shadow-violet-500/30 scale-105'
                                    : 'bg-slate-900/50 border-slate-700 hover:bg-slate-800'
                                }
                            `}
                        >
                            <span className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                {day.short}
                            </span>
                            <div className={`w-1.5 h-1.5 rounded-full mt-2 transition-all duration-300 ${isActive ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-slate-700'}`} />

                            {isSelected && (
                                <motion.div
                                    layoutId="activeDayGlow"
                                    className="absolute -bottom-1 w-8 h-1 bg-cyan-400/50 rounded-full blur-[4px]"
                                />
                            )}
                        </motion.button>
                    )
                })}
            </div>

            {/* Editor Panel */}
            <motion.div
                key={selectedDayId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-slate-900/80 border border-white/5 rounded-3xl p-6 relative overflow-hidden group"
            >
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-[80px] -z-10 group-hover:bg-violet-500/20 transition-all duration-700" />

                <div className="flex flex-col md:flex-row gap-8 items-start">

                    {/* Left: Active Toggle */}
                    <div className="flex flex-col gap-4 min-w-[150px]">
                        <h3 className="text-2xl font-bold text-white tracking-tight">{selectedDayName}</h3>

                        <label className="flex items-center gap-3 cursor-pointer group/toggle">
                            <motion.div
                                className={`
                                    w-14 h-8 rounded-full p-1 transition-colors duration-300 flex items-center border
                                    ${selectedDay?.activo ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-slate-800 border-slate-700'}
                                `}
                            >
                                <motion.div
                                    layout
                                    className={`
                                        w-6 h-6 rounded-full shadow-md
                                        ${selectedDay?.activo ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-slate-500'}
                                    `}
                                    animate={{ x: selectedDay?.activo ? 24 : 0 }}
                                />
                            </motion.div>
                            <span className={`font-medium transition-colors ${selectedDay?.activo ? 'text-emerald-400' : 'text-slate-500'}`}>
                                {selectedDay?.activo ? 'Abierto' : 'Cerrado'}
                            </span>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={selectedDay?.activo || false}
                                onChange={(e) => updateDay('activo', e.target.checked)}
                            />
                        </label>
                    </div>

                    {/* Right: Time Controls */}
                    <AnimatePresence mode="wait">
                        {selectedDay?.activo && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full"
                            >

                                {/* Main Hours */}
                                <div className="bg-slate-800/30 rounded-2xl p-5 border border-white/5 space-y-4">
                                    <div className="flex items-center gap-2 text-violet-300 mb-1">
                                        <SunIcon className="w-5 h-5" />
                                        <span className="text-sm font-medium">Jornada Laboral</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-slate-500 block mb-1">Apertura</label>
                                            <motion.input
                                                type="time"
                                                value={selectedDay.hora_apertura}
                                                onChange={(e) => updateDay('hora_apertura', e.target.value)}
                                                whileFocus={inputFocus}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-500 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 block mb-1">Cierre</label>
                                            <motion.input
                                                type="time"
                                                value={selectedDay.hora_cierre}
                                                onChange={(e) => updateDay('hora_cierre', e.target.value)}
                                                whileFocus={inputFocus}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-500 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Lunch Break */}
                                <div className="bg-slate-800/30 rounded-2xl p-5 border border-white/5 space-y-4">
                                    <div className="flex items-center gap-2 text-cyan-300 mb-1">
                                        <MoonIcon className="w-5 h-5" />
                                        <span className="text-sm font-medium">Descanso (Opcional)</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-slate-500 block mb-1">Inicio</label>
                                            <motion.input
                                                type="time"
                                                value={selectedDay.hora_inicio_almuerzo || ""}
                                                onChange={(e) => updateDay('hora_inicio_almuerzo', e.target.value)}
                                                whileFocus={inputFocus}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 placeholder-slate-600 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 block mb-1">Fin</label>
                                            <motion.input
                                                type="time"
                                                value={selectedDay.hora_fin_almuerzo || ""}
                                                onChange={(e) => updateDay('hora_fin_almuerzo', e.target.value)}
                                                whileFocus={inputFocus}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 placeholder-slate-600 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Actions Footer */}
                {selectedDay?.activo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-8 pt-4 border-t border-white/5 flex flex-wrap gap-4 items-center justify-between"
                    >
                        <motion.button
                            onClick={copyToAllWeekdays}
                            whileHover={{ scale: 1.05, backgroundColor: "rgba(139, 92, 246, 0.1)" }}
                            whileTap={{ scale: 0.95 }}
                            className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-violet-500/30"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
                                <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a.5.5 0 00-.146-.354l-3.268-3.268A.5.5 0 009.121 6H4.5z" />
                            </svg>
                            Copiar Horario (Lunes a Viernes)
                        </motion.button>
                    </motion.div>
                )}
            </motion.div>

            <div className="flex justify-between pt-4">
                <button
                    onClick={onBack}
                    className="px-6 py-2 rounded-lg text-slate-500 hover:text-white transition-colors"
                >
                    Atrás
                </button>
                <motion.button
                    onClick={onNext}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/20"
                >
                    Siguiente
                </motion.button>
            </div>
        </motion.div>
    );
}
