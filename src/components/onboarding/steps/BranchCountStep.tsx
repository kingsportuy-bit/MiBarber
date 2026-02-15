import { OnboardingData } from "../OnboardingWizard";
import { BuildingStorefrontIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

interface BranchCountStepProps {
    data: OnboardingData;
    updateData: (key: keyof OnboardingData, value: any) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function BranchCountStep({ data, updateData, onNext, onBack }: BranchCountStepProps) {
    const count = data.branchCount || 1;

    const handleIncrement = () => updateData("branchCount", Math.min(10, count + 1));
    const handleDecrement = () => updateData("branchCount", Math.max(1, count - 1));

    return (
        <motion.div
            className="space-y-8 py-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="space-y-2 text-center">
                <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
                    <BuildingStorefrontIcon className="w-10 h-10 text-cyan-400" />
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight">¿Cuántas sucursales tienes?</h2>
                <p className="text-slate-400 max-w-sm mx-auto text-lg">
                    Configuraremos cada una individualmente para que tu asistente pueda gestionarlas correctamente.
                </p>
            </div>

            <div className="flex items-center justify-center gap-8 py-10">
                <motion.button
                    onClick={handleDecrement}
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(30, 41, 59, 0.8)", borderColor: "rgba(139, 92, 246, 0.5)" }}
                    whileTap={{ scale: 0.9 }}
                    className="w-14 h-14 rounded-full bg-slate-900/50 border border-slate-700 text-white text-2xl font-bold flex items-center justify-center transition-colors shadow-lg shadow-black/20"
                >
                    -
                </motion.button>

                <div className="w-40 h-40 rounded-3xl bg-slate-900 border border-violet-500/30 flex items-center justify-center relative overflow-hidden group shadow-2xl shadow-violet-900/20">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-cyan-500/10 group-hover:from-violet-600/20 group-hover:to-cyan-500/20 transition-all duration-500" />

                    {/* Inner Glow */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-violet-500/10 to-transparent blur-xl" />

                    <AnimatePresence mode="popLayout">
                        <motion.span
                            key={count}
                            initial={{ y: 30, opacity: 0, scale: 0.5 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: -30, opacity: 0, scale: 0.5 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="text-7xl font-bold text-white relative z-10 drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                        >
                            {count}
                        </motion.span>
                    </AnimatePresence>
                </div>

                <motion.button
                    onClick={handleIncrement}
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(30, 41, 59, 0.8)", borderColor: "rgba(6, 182, 212, 0.5)" }}
                    whileTap={{ scale: 0.9 }}
                    className="w-14 h-14 rounded-full bg-slate-900/50 border border-slate-700 text-white text-2xl font-bold flex items-center justify-center transition-colors shadow-lg shadow-black/20"
                >
                    +
                </motion.button>
            </div>

            <div className="flex justify-between pt-8">
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
                    className="px-8 py-4 rounded-full font-bold bg-white text-slate-900 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all flex items-center gap-3"
                >
                    <span className="relative z-10">Continuar</span>
                    <ArrowRightIcon className="w-5 h-5 relative z-10" />
                </motion.button>
            </div>
        </motion.div>
    );
}
