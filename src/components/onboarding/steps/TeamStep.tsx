import { OnboardingData } from "../OnboardingWizard";
import { PlusIcon, TrashIcon, UserIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TeamStepProps {
    data: OnboardingData;
    updateData: (key: keyof OnboardingData, value: any) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function TeamStep({ data, updateData, onNext, onBack }: TeamStepProps) {
    const [newBarber, setNewBarber] = useState({
        nombre: "",
        celular: "",
        email: "",
        usuario: "",
        password: "",
        isAdmin: false
    });

    const [isAdding, setIsAdding] = useState(false);

    const handleAdd = () => {
        if (newBarber.nombre && newBarber.usuario && newBarber.password) {
            updateData("barberos", [...data.barberos, { ...newBarber, id: Date.now().toString() }]);
            setNewBarber({
                nombre: "",
                celular: "",
                email: "",
                usuario: "",
                password: "",
                isAdmin: false
            });
            setIsAdding(false);
        }
    };

    const removeBarber = (index: number) => {
        const updated = [...data.barberos];
        updated.splice(index, 1);
        updateData("barberos", updated);
    };

    const cancelAdd = () => {
        setIsAdding(false);
        setNewBarber({
            nombre: "",
            celular: "",
            email: "",
            usuario: "",
            password: "",
            isAdmin: false
        });
    };

    const inputFocus = { scale: 1.01, borderColor: "#a855f7", boxShadow: "0 0 0 2px rgba(168, 85, 247, 0.4)" };

    return (
        <motion.div
            className="space-y-6 h-[60vh] overflow-y-auto pr-2 custom-scrollbar"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="space-y-2">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <UserIcon className="w-6 h-6 text-cyan-400" />
                    Tu Equipo
                </h2>
                <p className="text-slate-400">
                    Agrega a los barberos que trabajarán contigo. Puedes hacerlo ahora o más tarde.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {/* Admin Card (Read-only visualization) */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-5 bg-violet-900/20 border border-violet-500/30 rounded-xl flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-violet-500/30">
                            {data.adminBarber.nombre.charAt(0)}
                        </div>
                        <div>
                            <p className="font-bold text-white text-lg">{data.adminBarber.nombre} (Tú)</p>
                            <p className="text-sm text-violet-300">Administrador</p>
                        </div>
                    </div>
                </motion.div>

                {/* List of added barbers */}
                <AnimatePresence>
                    {data.barberos.map((barber, idx) => (
                        <motion.div
                            key={barber.id || idx}
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            className="p-4 bg-slate-900/50 border border-slate-700 rounded-xl flex items-center justify-between overflow-hidden group hover:border-slate-500 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold border border-slate-600">
                                    {barber.nombre.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-medium text-white">{barber.nombre}</p>
                                    <div className="flex gap-2 text-xs">
                                        <span className="text-slate-400">{barber.usuario}</span>
                                        {barber.isAdmin && <span className="text-cyan-400 font-medium">• Admin</span>}
                                    </div>
                                </div>
                            </div>
                            <motion.button
                                onClick={() => removeBarber(idx)}
                                whileHover={{ scale: 1.1, backgroundColor: "rgba(244, 63, 94, 0.2)", color: "#f43f5e" }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 text-slate-500 rounded-full transition-colors"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </motion.button>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Add Form */}
                <AnimatePresence mode="wait">
                    {isAdding ? (
                        <motion.div
                            key="add-form"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="p-5 bg-slate-800/80 border border-slate-600 rounded-2xl space-y-4 backdrop-blur-sm"
                        >
                            <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wider">Nuevo Barbero</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <motion.input
                                    placeholder="Nombre"
                                    value={newBarber.nombre}
                                    onChange={(e) => setNewBarber({ ...newBarber, nombre: e.target.value })}
                                    whileFocus={inputFocus}
                                    className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-cyan-500 transition-all placeholder-slate-500"
                                />
                                <motion.input
                                    placeholder="Celular"
                                    value={newBarber.celular}
                                    onChange={(e) => setNewBarber({ ...newBarber, celular: e.target.value })}
                                    whileFocus={inputFocus}
                                    className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-cyan-500 transition-all placeholder-slate-500"
                                />
                                <motion.input
                                    placeholder="Usuario"
                                    value={newBarber.usuario}
                                    onChange={(e) => setNewBarber({ ...newBarber, usuario: e.target.value })}
                                    whileFocus={inputFocus}
                                    className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-cyan-500 transition-all placeholder-slate-500"
                                />
                                <motion.input
                                    type="password"
                                    placeholder="Contraseña"
                                    value={newBarber.password}
                                    onChange={(e) => setNewBarber({ ...newBarber, password: e.target.value })}
                                    whileFocus={inputFocus}
                                    className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-cyan-500 transition-all placeholder-slate-500"
                                />
                                <motion.input
                                    placeholder="Email (opcional)"
                                    value={newBarber.email}
                                    onChange={(e) => setNewBarber({ ...newBarber, email: e.target.value })}
                                    whileFocus={inputFocus}
                                    className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-sm col-span-1 md:col-span-2 focus:outline-none focus:border-cyan-500 transition-all placeholder-slate-500"
                                />

                                <div className="col-span-1 md:col-span-2 flex items-center gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                                    <input
                                        type="checkbox"
                                        id="isAdmin"
                                        checked={newBarber.isAdmin}
                                        onChange={(e) => setNewBarber({ ...newBarber, isAdmin: e.target.checked })}
                                        className="rounded border-slate-600 w-4 h-4 text-violet-500 focus:ring-violet-500 bg-slate-800"
                                    />
                                    <label htmlFor="isAdmin" className="text-sm text-slate-300 font-medium">Es Administrador (Acceso total)</label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <button onClick={cancelAdd} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">Cancelar</button>
                                <motion.button
                                    onClick={handleAdd}
                                    disabled={!newBarber.nombre || !newBarber.usuario || !newBarber.password}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-6 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-violet-500/20 disabled:opacity-50 disabled:shadow-none transition-all"
                                >
                                    Guardar Barbero
                                </motion.button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.button
                            key="add-button"
                            onClick={() => setIsAdding(true)}
                            whileHover={{ scale: 1.02, backgroundColor: "rgba(30, 41, 59, 0.8)", borderColor: "rgba(139, 92, 246, 0.4)" }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-4 border border-dashed border-slate-700 rounded-2xl text-slate-400 group hover:text-white hover:border-slate-500 transition-all flex items-center justify-center gap-3 bg-slate-900/20"
                        >
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-violet-600 transition-colors">
                                <PlusIcon className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-medium">Agregar Nuevo Barbero</span>
                        </motion.button>
                    )}
                </AnimatePresence>
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
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/20"
                >
                    {data.barberos.length === 0 ? "Continuar sin equipo" : "Siguiente"}
                </motion.button>
            </div>
        </motion.div>
    );
}
