import { OnboardingData } from "../OnboardingWizard";
import { useState, useEffect } from "react";
import { ArrowPathIcon, CheckCircleIcon, DevicePhoneMobileIcon, ChatBubbleLeftRightIcon, ExclamationTriangleIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { submitOnboardingData, pollBarberConvReady, getInstanceQR } from "@/lib/actions/onboarding";
import { AuthService } from "@/features/auth/services/AuthService";
import { motion, AnimatePresence } from "framer-motion";

interface ActivationStepProps {
    data: OnboardingData;
    onBack: () => void;
}

interface BarberStatus {
    nombre: string;
    confirmado: boolean;
}

export default function ActivationStep({ data, onBack }: ActivationStepProps) {
    const [status, setStatus] = useState<'idle' | 'generating' | 'ready' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [barberosConfirmados, setBarberosConfirmados] = useState<BarberStatus[]>([]);
    const [pollingActive, setPollingActive] = useState(false);
    const [sucursalId, setSucursalId] = useState<string | null>(null);
    const [instanceName, setInstanceName] = useState<string | null>(null);

    const allBarberos = [
        { nombre: data.adminBarber.nombre, confirmado: false },
        ...Object.values(data.barberosPorSucursal).flat().map((b: any) => ({ nombre: b.nombre || b.usuario, confirmado: false }))
    ];

    const totalBarberos = allBarberos.length;

    const generateAssistant = async () => {
        setStatus('generating');
        setErrorMessage(null);

        try {
            const result = await submitOnboardingData(data);

            if (result.success && result.session) {
                AuthService.saveSession(result.session);

                if (result.instanceName) {
                    setInstanceName(result.instanceName);
                    const qrResult = await getInstanceQR(result.instanceName);
                    if (qrResult.qrCode) {
                        setQrCode(qrResult.qrCode);
                    } else if (qrResult.connected) {
                        setQrCode("https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg");
                    }
                }

                if (result.sucursalId) {
                    setSucursalId(result.sucursalId);
                }

                const initialBarberos = [
                    { nombre: data.adminBarber.nombre, confirmado: false },
                    ...Object.values(data.barberosPorSucursal).flat().map((b: any) => ({ nombre: b.nombre || b.usuario, confirmado: false }))
                ];
                setBarberosConfirmados(initialBarberos);
                setStatus('ready');
                setPollingActive(true);
            } else {
                throw new Error(result.error || "Error desconocido al crear la cuenta");
            }
        } catch (error: any) {
            console.error("Error en onboarding:", error);
            setErrorMessage(error.message);
            setStatus('error');
        }
    };

    useEffect(() => {
        if (status === 'ready' && pollingActive && sucursalId && instanceName) {
            const pollBarberos = async () => {
                try {
                    const [qrResult, barberResult] = await Promise.all([
                        getInstanceQR(instanceName),
                        pollBarberConvReady(sucursalId)
                    ]);

                    if (qrResult.connected) {
                        setQrCode(null);
                    } else if (qrResult.qrCode && !qrCode) {
                        setQrCode(qrResult.qrCode);
                    }

                    if (barberResult.barbers && barberResult.barbers.length > 0) {
                        setBarberosConfirmados(prev => {
                            return prev.map((b, idx) => {
                                const serverBarber = barberResult.barbers[idx];
                                if (serverBarber) {
                                    return { ...b, confirmado: serverBarber.verified };
                                }
                                return b;
                            });
                        });

                        if (barberResult.ready) {
                            setPollingActive(false);
                        }
                    }
                } catch (error) {
                    console.error("Error polling:", error);
                }
            };

            pollBarberos();
            const interval = setInterval(pollBarberos, 5000);

            return () => clearInterval(interval);
        }
    }, [status, pollingActive, sucursalId, instanceName]);

    const todosConfirmados = barberosConfirmados.length > 0 && barberosConfirmados.every(b => b.confirmado);

    const finishProcess = () => {
        if (!todosConfirmados) return;
        setStatus('success');
        setTimeout(() => {
            window.location.href = "/inicio";
        }, 2000);
    };

    return (
        <motion.div
            className="space-y-8 text-center py-4 px-2"
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
                                className="w-full px-8 py-4 !bg-gradient-to-r !from-violet-600 !to-indigo-600 text-white font-bold text-xl rounded-full shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_50px_rgba(139,92,246,0.6)] transition-all duration-300"
                            >
                                Generar Asistente IA
                            </motion.button>
                            <button onClick={onBack} className="text-slate-500 hover:text-white transition-colors text-sm bg-none">Volver a revisar</button>
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
                                className="px-6 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors bg-none"
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
                                Pasos para activar:
                            </h3>
                            <ol className="list-decimal list-inside space-y-4 text-slate-300 text-sm">
                                <li className="space-y-1">
                                    <span className="text-white font-medium">Crea un grupo desde tu número personal</span> y agrega al WhatsApp de la barbería.
                                </li>
                                <li className="space-y-2">
                                    <span className="text-white font-medium">Todos los barberos</span> deben escribir el mismo código desde su propio celular en el grupo:<br /> 
                                    <span className="text-cyan-300 font-mono bg-cyan-900/30 px-3 py-2 rounded-lg mt-2 block w-fit border border-cyan-500/20 text-base">
                                        barbero - {data.adminBarber.nombre}
                                    </span>
                                    <span className="text-amber-400 text-xs block mt-1">⚠️ Todos deben escribirlo antes de continuar</span>
                                </li>
                                <li>Escanea el código QR para vincular el dispositivo.</li>
                            </ol>
                        </div>

                        {barberosConfirmados.length > 0 && (
                            <div className="max-w-md mx-auto w-full space-y-3">
                                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                                    <UserGroupIcon className="w-5 h-5 text-violet-400" />
                                    Estado de barberos:
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {barberosConfirmados.map((barbero, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className={`
                                                flex items-center justify-between p-3 rounded-xl border transition-all
                                                ${barbero.confirmado 
                                                    ? 'bg-emerald-500/10 border-emerald-500/30' 
                                                    : 'bg-slate-800/50 border-slate-700'
                                                }
                                            `}
                                        >
                                            <span className={`text-sm ${barbero.confirmado ? 'text-emerald-400' : 'text-slate-300'}`}>
                                                {barbero.nombre}
                                            </span>
                                            {barbero.confirmado ? (
                                                <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
                                            ) : (
                                                <div className="w-5 h-5 rounded-full border-2 border-slate-600" />
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-500 text-center">
                                    {pollingActive ? 'Esperando mensajes de los barberos...' : 'Todos los barberos han confirmado'}
                                </p>
                            </div>
                        )}

                        <motion.button
                            onClick={finishProcess}
                            disabled={!todosConfirmados}
                            whileHover={todosConfirmados ? { scale: 1.05 } : {}}
                            whileTap={todosConfirmados ? { scale: 0.95 } : {}}
                            className={`
                                w-full max-w-md px-6 py-4 font-bold text-lg rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all
                                ${todosConfirmados
                                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
                                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                }
                            `}
                        >
                            {!todosConfirmados 
                                ? `Esperando confirmaciones (${barberosConfirmados.filter(b => b.confirmado).length}/${barberosConfirmados.length})`
                                : '¡Listo! Ya escaneé el código'
                            }
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
