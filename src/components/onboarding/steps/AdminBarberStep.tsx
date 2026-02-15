import { OnboardingData } from "../OnboardingWizard";
import { motion } from "framer-motion";

interface AdminBarberStepProps {
    data: OnboardingData;
    updateData: (key: keyof OnboardingData, value: any) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function AdminBarberStep({ data, updateData, onNext, onBack }: AdminBarberStepProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateData("adminBarber", { ...data.adminBarber, [e.target.name]: e.target.value });
    };

    const isValid =
        data.adminBarber.nombre.trim() !== "" &&
        data.adminBarber.celular.trim() !== "" &&
        data.adminBarber.email.trim() !== "" &&
        data.adminBarber.usuario.trim() !== "" &&
        data.adminBarber.password.trim().length >= 6;

    const inputFocus = { scale: 1.01, borderColor: "#a855f7", boxShadow: "0 0 0 2px rgba(168, 85, 247, 0.4)" };

    return (
        <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="space-y-2">
                <h2 className="text-xl font-semibold text-white">Administrador Principal</h2>
                <p className="text-slate-400">
                    Tus datos personales para acceder al sistema y gestionar tu barbería.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="col-span-1 md:col-span-2 space-y-1">
                    <label className="block text-sm font-medium text-slate-300 mb-1">Nombre Completo</label>
                    <motion.input
                        name="nombre"
                        value={data.adminBarber.nombre}
                        onChange={handleChange}
                        placeholder="Juan Pérez"
                        whileFocus={inputFocus}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-violet-500 transition-all placeholder-slate-600"
                    />
                </div>

                <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-300 mb-1">Celular Personal</label>
                    <motion.input
                        name="celular"
                        value={data.adminBarber.celular}
                        onChange={handleChange}
                        placeholder="+598 99 111 222"
                        whileFocus={inputFocus}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-violet-500 transition-all placeholder-slate-600"
                    />
                    <p className="text-xs text-slate-500 mt-1">Aquí recibirás reportes y agenda diaria.</p>
                </div>

                <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                    <motion.input
                        type="email"
                        name="email"
                        value={data.adminBarber.email}
                        onChange={handleChange}
                        placeholder="juan@ejemplo.com"
                        whileFocus={inputFocus}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-violet-500 transition-all placeholder-slate-600"
                    />
                </div>

                <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-300 mb-1">Usuario</label>
                    <motion.input
                        name="usuario"
                        value={data.adminBarber.usuario}
                        onChange={handleChange}
                        placeholder="juan.barber"
                        whileFocus={inputFocus}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-violet-500 transition-all placeholder-slate-600"
                    />
                </div>

                <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-300 mb-1">Contraseña</label>
                    <motion.input
                        type="password"
                        name="password"
                        value={data.adminBarber.password}
                        onChange={handleChange}
                        placeholder="******"
                        whileFocus={inputFocus}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-violet-500 transition-all placeholder-slate-600"
                    />
                    <p className="text-xs text-slate-500 mt-1">Mínimo 6 caracteres.</p>
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <button
                    onClick={onBack}
                    className="px-6 py-2 rounded-lg text-slate-500 hover:text-white transition-colors"
                >
                    Atrás
                </button>
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
