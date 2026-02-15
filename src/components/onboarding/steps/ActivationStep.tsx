import { OnboardingData } from "../OnboardingWizard";
import { useState } from "react";
import { ArrowPathIcon, CheckCircleIcon, DevicePhoneMobileIcon, ChatBubbleLeftRightIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { submitOnboardingData } from "@/lib/actions/onboarding";
import { AuthService } from "@/features/auth/services/AuthService";
import { motion, AnimatePresence } from "framer-motion";

interface ActivationStepProps {
    data: OnboardingData;
    onBack: () => void;
}

export default function ActivationStep({ data, onBack }: ActivationStepProps) {
    const [status, setStatus] = useState<'idle' | 'generating' | 'ready' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [qrCode, setQrCode] = useState<string | null>(null);

    const generateAssistant = async () => {
        setStatus('generating');
        setErrorMessage(null);

        try {
            // 1. Submit data to server
            const result = await submitOnboardingData(data); // This is now a real server action

            if (result.success && result.session) {
                // 2. Save session locally explicitly to ensure consistency
                AuthService.saveSession(result.session);

                // 3. Show QR (Mock for now, would be result.qrCode if we returned it)
                setQrCode("https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg");
                setStatus('ready');
            } else {
                throw new Error(result.error || "Error desconocido al crear la cuenta");
            }
        } catch (error: any) {
            console.error("Error en onboarding:", error);
            setErrorMessage(error.message);
            setStatus('error');
        }
    };

    const finishProcess = () => {
        setStatus('success');
        // Here we would redirect to dashboard
        setTimeout(() => {
            window.location.href = "/inicio";
        }, 2000);
    };

    return (
        <motion.div
            className="space-y-8 h-[calc(100vh-240px)] sm:h-[60vh] overflow-y-auto custom-scrollbar text-center py-4 px-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
        >
            <AnimatePresence mode="wait">
                {status === 'idle' && (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="space-y-8 flex flex-col items-center justify-center h-full"
                    >
                        <div className="space-y-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-violet-500/30 rounded-full blur-2xl animate-pulse"></div>
                                <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(139,92,246,0.5)] border border-violet-500/50 relative z-10">
                                    <ChatBubbleLeftRightIcon className="w-12 h-12 text-violet-400" />
                                </div>
                            </div>
                            <h2 className="text-3xl font-bold text-white tracking-tight">¡Todo listo para activar tu IA!</h2>
                            <p className="text-slate-400 max-w-md mx-auto text-lg leading-relaxed">
                                Al hacer clic en el botón siguiente, crearemos tu asistente virtual y generaremos un código QR para conectar tu WhatsApp.
                            </p>
                        </div>

                        <div className="pt-4 w-full max-w-sm space-y-4">
                            <motion.button
                                onClick={generateAssistant}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-full px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xl rounded-full shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_50px_rgba(139,92,246,0.6)] transition-all duration-300"
                            >
                                Generar Asistente IA
                            </motion.button>
                            <button onClick={onBack} className="text-slate-500 hover:text-white transition-colors text-sm">Volver a revisar</button>
                        </div>
                    </motion.div>
                )}

                {status === 'generating' && (
                    <motion.div
                        key="generating"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-12 space-y-8 flex flex-col items-center justify-center h-full"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full" />
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="relative z-10"
                            >
                                <ArrowPathIcon className="w-20 h-20 text-cyan-400" />
                            </motion.div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-white">Configurando tu Barbería...</h3>
                            <p className="text-slate-400">Creando servicios, usuarios y conectando con Evolution API.</p>
                        </div>
                    </motion.div>
                )}

                {status === 'error' && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="py-8 space-y-6 flex flex-col items-center justify-center h-full"
                    >
                        <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                            <ExclamationTriangleIcon className="w-12 h-12 text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white">Ocurrió un error</h3>
                            <p className="text-red-400 max-w-md mx-auto mt-2">{errorMessage}</p>
                        </div>

                        <div className="flex justify-center gap-4 pt-4">
                            <button
                                onClick={onBack}
                                className="px-6 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                            >
                                Revisar datos
                            </button>
                            <motion.button
                                onClick={generateAssistant}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-xl shadow-lg transition-all"
                            >
                                Intentar de nuevo
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {status === 'ready' && (
                    <motion.div
                        key="ready"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6 flex flex-col items-center"
                    >
                        <div className="bg-white p-4 rounded-2xl inline-block shadow-[0_0_50px_rgba(6,182,212,0.3)] relative group border-4 border-slate-900">
                            {/* Replace with actual QR Image component */}
                            <img src={qrCode || ""} alt="WhatsApp QR" className="w-64 h-64 object-contain" />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-slate-900/90 text-white px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm border border-white/20">
                                    Escanear con WhatsApp
                                </div>
                            </div>
                        </div>

                        <div className="max-w-md mx-auto space-y-4 text-left bg-slate-900/80 p-6 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                                <DevicePhoneMobileIcon className="w-6 h-6 text-cyan-400" />
                                Pasos finales:
                            </h3>
                            <ol className="list-decimal list-inside space-y-3 text-slate-300 text-sm">
                                <li>Abre WhatsApp en tu celular.</li>
                                <li>Ve a <strong>Dispositivos vinculados</strong> {'>'} <strong>Vincular dispositivo</strong>.</li>
                                <li>Escanea el código QR que ves en pantalla.</li>
                                <li>Envía un mensaje al número conectado con el texto: <br /> <span className="text-cyan-300 font-mono bg-cyan-900/30 px-2 py-1 rounded mt-2 block w-fit border border-cyan-500/20">"barbero - {data.adminBarber.nombre}"</span></li>
                            </ol>
                        </div>

                        <motion.button
                            onClick={finishProcess}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full max-w-md px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-lg rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all"
                        >
                            ¡Listo! Ya escaneé el código
                        </motion.button>
                    </motion.div>
                )}

                {status === 'success' && (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-12 space-y-6 flex flex-col items-center justify-center h-full"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            className="w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_80px_rgba(16,185,129,0.5)] border-4 border-emerald-400"
                        >
                            <CheckCircleIcon className="w-20 h-20 text-white" />
                        </motion.div>
                        <div>
                            <h3 className="text-3xl font-bold text-white mb-2">¡Bienvenido a Barberox!</h3>
                            <p className="text-slate-400 text-lg">Redirigiendo a tu panel de control...</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
