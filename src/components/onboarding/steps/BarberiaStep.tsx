import { OnboardingData } from "../OnboardingWizard";
import { motion } from "framer-motion";

interface BarberiaStepProps {
    data: OnboardingData;
    updateData: (key: keyof OnboardingData, value: any) => void;
    onNext: () => void;
}

export default function BarberiaStep({ data, updateData, onNext }: BarberiaStepProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateData("barberia", { ...data.barberia, nombre: e.target.value });
    };

    const isValid = data.barberia.nombre.trim().length > 0;

    return (
        <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="space-y-2">
                <h2 className="text-xl font-semibold text-white">Nombre de tu Barbería</h2>
                <p className="text-slate-400">
                    ¿Cómo se llama tu negocio? Este nombre será visible para tus clientes y en los mensajes automáticos.
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-slate-300 mb-1">
                        Nombre del Negocio
                    </label>
                    <motion.input
                        type="text"
                        id="nombre"
                        whileFocus={{ scale: 1.01, borderColor: "#8b5cf6", boxShadow: "0 0 0 2px rgba(139, 92, 246, 0.2)" }}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all"
                        placeholder="Ej: Barbería Estilo & Corte"
                        value={data.barberia.nombre}
                        onChange={handleChange}
                        autoFocus
                    />
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <motion.button
                    onClick={onNext}
                    disabled={!isValid}
                    whileHover={isValid ? { scale: 1.05 } : {}}
                    whileTap={isValid ? { scale: 0.95 } : {}}
                    className={`
                        px-8 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg
                        ${isValid
                            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-violet-500/20 hover:shadow-violet-500/40'
                            : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                        }
                    `}
                >
                    Siguiente
                </motion.button>
            </div>
        </motion.div>
    );
}
