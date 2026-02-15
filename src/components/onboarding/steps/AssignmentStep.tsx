import { OnboardingData } from "../OnboardingWizard";
import { UserIcon, CheckBadgeIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AssignmentStepProps {
    data: OnboardingData;
    updateData: (key: keyof OnboardingData, value: any) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function AssignmentStep({ data, updateData, onNext, onBack }: AssignmentStepProps) {
    // Combine admin and barbers into a single list
    const allStaff = [
        { ...data.adminBarber, id: "admin", role: "Administrador" },
        ...data.barberos.map(b => ({ ...b, role: b.isAdmin ? "Admin" : "Barbero" }))
    ];

    const [expandedBarberId, setExpandedBarberId] = useState<string | null>(allStaff[0]?.id || null);

    const toggleAssignment = (barberId: string, serviceId: string) => {
        const currentAssignments = data.asignaciones[barberId] || [];
        const isAssigned = currentAssignments.includes(serviceId);

        let newAssignments;
        if (isAssigned) {
            newAssignments = currentAssignments.filter(id => id !== serviceId);
        } else {
            newAssignments = [...currentAssignments, serviceId];
        }

        updateData("asignaciones", {
            ...data.asignaciones,
            [barberId]: newAssignments
        });
    };

    return (
        <motion.div
            className="space-y-6 h-[calc(100vh-240px)] sm:h-[60vh] overflow-y-auto pr-2 custom-scrollbar"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="space-y-2">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <UserIcon className="w-6 h-6 text-cyan-400" />
                    Asignación de Servicios
                </h2>
                <p className="text-slate-400">
                    Toca un barbero para asignarle sus servicios.
                </p>
            </div>

            <div className="space-y-4">
                <AnimatePresence>
                    {allStaff.map(barber => {
                        const isExpanded = expandedBarberId === barber.id;
                        const assignedCount = (data.asignaciones[barber.id] || []).length;

                        return (
                            <motion.div
                                key={barber.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`rounded-2xl border transition-all duration-300 overflow-hidden
                                    ${isExpanded
                                        ? 'bg-slate-800/80 border-violet-500/30 shadow-lg shadow-violet-900/10'
                                        : 'bg-slate-900/30 border-white/5 hover:bg-slate-800/60'
                                    }
                                `}
                            >
                                <button
                                    onClick={() => setExpandedBarberId(isExpanded ? null : barber.id)}
                                    className="w-full p-4 flex items-center justify-between text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-colors duration-300
                                            ${isExpanded ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400'}
                                        `}>
                                            {barber.nombre.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className={`font-medium text-lg ${isExpanded ? 'text-white' : 'text-slate-300'}`}>
                                                {barber.nombre}
                                            </h3>
                                            <p className="text-slate-500 text-xs flex items-center gap-2">
                                                {barber.role}
                                                {assignedCount > 0 && (
                                                    <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                                        {assignedCount} servicios
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <motion.div
                                        animate={{ rotate: isExpanded ? 180 : 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <ChevronDownIcon className={`w-5 h-5 ${isExpanded ? 'text-white' : 'text-slate-500'}`} />
                                    </motion.div>
                                </button>

                                {/* Expanded Service List */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                        >
                                            <div className="p-4 pt-0 border-t border-white/5">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                                                    {data.servicios.map(service => {
                                                        const isAssigned = (data.asignaciones[barber.id] || []).includes(service.id);
                                                        return (
                                                            <motion.button
                                                                key={service.id}
                                                                whileHover={{ scale: 1.02 }}
                                                                whileTap={{ scale: 0.98 }}
                                                                onClick={() => toggleAssignment(barber.id, service.id)}
                                                                className={`
                                                                    relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 group
                                                                    ${isAssigned
                                                                        ? 'bg-violet-500/20 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                                                                        : 'bg-slate-900/50 border-white/5 hover:bg-slate-800'
                                                                    }
                                                                `}
                                                            >
                                                                <div className={`
                                                                    w-6 h-6 rounded-lg flex items-center justify-center border transition-all duration-300
                                                                    ${isAssigned
                                                                        ? 'bg-violet-500 border-violet-500 scale-110'
                                                                        : 'border-slate-600 group-hover:border-slate-400'
                                                                    }
                                                                `}>
                                                                    {isAssigned && <CheckBadgeIcon className="w-4 h-4 text-white" />}
                                                                </div>

                                                                <div className="text-left flex-1">
                                                                    <span className={`block text-sm font-medium transition-colors ${isAssigned ? 'text-white' : 'text-slate-400'}`}>
                                                                        {service.nombre}
                                                                    </span>
                                                                    <span className="text-xs text-slate-500">${service.precio}</span>
                                                                </div>
                                                            </motion.button>
                                                        );
                                                    })}
                                                    {data.servicios.length === 0 && (
                                                        <p className="text-slate-500 text-sm italic p-2 text-center col-span-2">No hay servicios creados.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            <div className="flex justify-between pt-4 pb-2">
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
                    className="px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-violet-500/20 transition-all duration-300"
                >
                    Finalizar
                </motion.button>
            </div>
        </motion.div>
    );
}
