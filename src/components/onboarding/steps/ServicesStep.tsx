import { OnboardingData } from "../OnboardingWizard";
import { PlusIcon, TrashIcon, SparklesIcon, CurrencyDollarIcon, ClockIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ServicesStepProps {
    data: OnboardingData;
    updateData: (key: keyof OnboardingData, value: any) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function ServicesStep({ data, updateData, onNext, onBack }: ServicesStepProps) {
    const [newService, setNewService] = useState({
        nombre: "",
        precio: "",
        duracion: "30",
        descripcion: ""
    });
    const [isAdding, setIsAdding] = useState(false);

    const handleAdd = () => {
        if (newService.nombre && newService.precio && newService.duracion) {
            updateData("servicios", [...data.servicios, { ...newService, id: Date.now().toString() }]);
            setNewService({
                nombre: "",
                precio: "",
                duracion: "30",
                descripcion: ""
            });
            setIsAdding(false);
        }
    };

    const removeService = (index: number) => {
        const updated = [...data.servicios];
        updated.splice(index, 1);
        updateData("servicios", updated);
    };

    const inputFocus = { scale: 1.01, borderColor: "#a855f7", boxShadow: "0 0 0 2px rgba(168, 85, 247, 0.4)" };

    return (
        <motion.div
            className="space-y-6 h-[calc(100vh-240px)] sm:h-[60vh] overflow-y-auto pr-2 custom-scrollbar"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="space-y-2">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <SparklesIcon className="w-6 h-6 text-yellow-400" />
                    Tus Servicios
                </h2>
                <p className="text-slate-400">
                    Crea el menú de servicios. Tu IA usará los detalles para vender por ti.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence mode="popLayout">
                    {data.servicios.map((service, idx) => (
                        <motion.div
                            key={service.id || idx}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="group relative bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 hover:bg-slate-800/60 transition-colors flex flex-col sm:flex-row gap-4 sm:items-center justify-between shadow-lg shadow-black/20"
                        >
                            <div className="flex-1 space-y-2">
                                <h3 className="text-lg font-bold text-white tracking-wide">{service.nombre}</h3>
                                <p className="text-sm text-slate-400 line-clamp-2">{service.descripcion}</p>

                                <div className="flex gap-4 mt-2">
                                    <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full text-xs font-bold border border-emerald-400/20">
                                        <CurrencyDollarIcon className="w-3.5 h-3.5" />
                                        <span>${service.precio}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full text-xs font-bold border border-cyan-400/20">
                                        <ClockIcon className="w-3.5 h-3.5" />
                                        <span>{service.duracion} min</span>
                                    </div>
                                </div>
                            </div>

                            <motion.button
                                onClick={() => removeService(idx)}
                                whileHover={{ scale: 1.1, backgroundColor: "rgba(244, 63, 94, 0.2)", color: "#f43f5e" }}
                                whileTap={{ scale: 0.9 }}
                                className="absolute top-4 right-4 sm:static sm:p-2 text-slate-600 rounded-full transition-colors"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </motion.button>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {data.servicios.length === 0 && !isAdding && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-3xl bg-slate-900/20"
                    >
                        <SparklesIcon className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-500 font-medium text-lg">Aún no tienes servicios.</p>
                        <p className="text-slate-600 text-sm mt-1">Agrega servicios para empezar.</p>
                    </motion.div>
                )}
            </div>

            <AnimatePresence mode="wait">
                {isAdding ? (
                    <motion.div
                        key="add-form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="bg-slate-800/80 backdrop-blur-xl border border-violet-500/20 rounded-2xl p-6 space-y-5 shadow-2xl ring-1 ring-violet-500/30"
                    >
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <h3 className="text-base font-bold text-white uppercase tracking-wider">Nuevo Servicio</h3>
                            <button onClick={() => setIsAdding(false)} className="text-slate-500 hover:text-white text-sm flex items-center gap-1 transition-colors">
                                <XMarkIcon className="w-4 h-4" /> Cancelar
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-xs text-slate-400 ml-1 font-medium">Nombre</label>
                                <motion.input
                                    placeholder="Ej: Corte Degradado"
                                    value={newService.nombre}
                                    autoFocus
                                    onChange={(e) => setNewService({ ...newService, nombre: e.target.value })}
                                    whileFocus={inputFocus}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-400 ml-1 font-medium">Precio</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-3 text-slate-500">$</span>
                                        <motion.input
                                            type="number"
                                            placeholder="00"
                                            value={newService.precio}
                                            onChange={(e) => setNewService({ ...newService, precio: e.target.value })}
                                            whileFocus={inputFocus}
                                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 pl-7 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-400 ml-1 font-medium">Duración</label>
                                    <div className="relative">
                                        <motion.input
                                            type="number"
                                            placeholder="30"
                                            value={newService.duracion}
                                            onChange={(e) => setNewService({ ...newService, duracion: e.target.value })}
                                            whileFocus={inputFocus}
                                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all"
                                        />
                                        <span className="absolute right-3 top-3 text-slate-500 text-xs font-medium">min</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-slate-400 ml-1 font-medium">Descripción para IA</label>
                                <motion.textarea
                                    placeholder="Explica en qué consiste el servicio..."
                                    value={newService.descripcion}
                                    onChange={(e) => setNewService({ ...newService, descripcion: e.target.value })}
                                    whileFocus={inputFocus}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500 resize-none transition-all"
                                    rows={3}
                                />
                            </div>
                        </div>

                        <motion.button
                            onClick={handleAdd}
                            disabled={!newService.nombre || !newService.precio || !newService.duracion}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl text-white font-bold shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Guardar Servicio
                        </motion.button>
                    </motion.div>
                ) : (
                    <motion.button
                        key="add-btn"
                        onClick={() => setIsAdding(true)}
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(30, 41, 59, 0.8)", borderColor: "rgba(139, 92, 246, 0.4)" }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-4 border border-dashed border-slate-700 bg-slate-900/20 rounded-2xl text-slate-400 flex flex-col items-center justify-center gap-3 group transition-all"
                    >
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-violet-600 transition-colors">
                            <PlusIcon className="w-6 h-6 text-slate-400 group-hover:text-white" />
                        </div>
                        <span className="font-medium group-hover:text-white transition-colors">Agregar Nuevo Servicio</span>
                    </motion.button>
                )}
            </AnimatePresence>

            <div className="flex justify-between pt-4 pb-2">
                <button
                    onClick={onBack}
                    className="px-6 py-2 rounded-lg text-slate-500 hover:text-white transition-colors"
                >
                    Atrás
                </button>
                <motion.button
                    onClick={onNext}
                    disabled={data.servicios.length === 0}
                    whileHover={data.servicios.length > 0 ? { scale: 1.05 } : {}}
                    whileTap={data.servicios.length > 0 ? { scale: 0.95 } : {}}
                    className={`
                        px-8 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg
                        ${data.servicios.length > 0
                            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-violet-500/30 hover:shadow-violet-500/50'
                            : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                        }
                    `}
                >
                    Continuar
                </motion.button>
            </div>
        </motion.div>
    );
}
