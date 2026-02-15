import { OnboardingData } from "../OnboardingWizard";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

interface WelcomeStepProps {
    onNext: () => void;
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-8">

            {/* Logo Container with Glow */}
            <motion.div
                className="relative group"
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
                <div className="absolute inset-0 bg-purple-500/20 blur-[50px] rounded-full group-hover:bg-purple-500/30 transition-all duration-700" />
                <img
                    src="/logo-barberox.png"
                    alt="Barberox Logo"
                    className="w-48 h-auto relative z-10 drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                />
            </motion.div>

            <div className="space-y-2 max-w-md mx-auto">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl font-bold text-white tracking-tight"
                >
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                        Bienvenido al Futuro
                    </span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-slate-400"
                >
                    Gestiona tu barbería con el poder de la Inteligencia Artificial.
                </motion.p>
            </div>

            <div className="pt-8">
                <motion.button
                    onClick={onNext}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-lg rounded-full shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:shadow-[0_0_50px_rgba(124,58,237,0.6)] transition-all duration-300 flex items-center gap-3 overflow-hidden"
                >
                    <span className="relative z-10">Iniciar Configuración</span>
                    <ArrowRightIcon className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />

                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>
            </div>

        </div>
    );
}
