import { OnboardingData } from "../OnboardingWizard";
import { useState, useEffect } from "react";
import { BuildingStorefrontIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

interface SucursalStepProps {
    data: OnboardingData;
    updateData: (key: keyof OnboardingData, value: any) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function SucursalStep({ data, updateData, onNext, onBack }: SucursalStepProps) {
    const isMultiBranch = data.branchCount > 1;
    const currentBranchNum = data.currentBranchIndex + 1;

    // Auto-set name if single branch
    useEffect(() => {
        if (!isMultiBranch && data.barberia.nombre && (!data.sucursal.nombre || data.sucursal.nombre === "")) {
            updateData("sucursal", { ...data.sucursal, nombre: data.barberia.nombre, apodo: "Principal" });
        }
    }, [isMultiBranch, data.barberia.nombre]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        // Special logic for nickname
        if (name === 'apodo') {
            const fullTitle = `${data.barberia.nombre} ${value}`;
            updateData("sucursal", {
                ...data.sucursal,
                apodo: value,
                nombre: fullTitle
            });
        } else {
            updateData("sucursal", { ...data.sucursal, [name]: value });
        }
    };

    // Validation
    const isValid =
        data.sucursal.nombre.trim() !== "" &&
        data.sucursal.telefono.trim() !== "" &&
        data.sucursal.direccion.trim() !== "" &&
        data.sucursal.ciudad.trim() !== "";

    const inputFocus = { scale: 1.01, borderColor: "#a855f7", boxShadow: "0 0 0 2px rgba(168, 85, 247, 0.4)" };

    return (
        <motion.div
            className="space-y-8 h-[60vh] overflow-y-auto pr-2 custom-scrollbar"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="space-y-2">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <BuildingStorefrontIcon className="w-6 h-6 text-cyan-400" />
                    {isMultiBranch ? `Sucursal ${currentBranchNum} (${data.sucursal.apodo || 'Nueva'})` : 'Detalles de la Sucursal'}
                </h2>
                <p className="text-slate-400">
                    Información de contacto y ubicación.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Conditional Naming Input */}
                {isMultiBranch ? (
                    <div className="col-span-1 md:col-span-2 space-y-1">
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            Apodo / Identificador de Sucursal
                            <span className="text-cyan-400 ml-1">*</span>
                        </label>
                        <motion.input
                            name="apodo"
                            value={data.sucursal.apodo || ""}
                            onChange={handleChange}
                            placeholder="Ej: Centro, Shopping, Pocitos"
                            autoFocus
                            whileFocus={inputFocus}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500 transition-all placeholder-slate-600"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            Nombre completo visible: <span className="text-slate-300">{data.sucursal.nombre || data.barberia.nombre + " ..."}</span>
                        </p>
                    </div>
                ) : (
                    <div className="col-span-1 md:col-span-2 bg-slate-900/40 p-5 rounded-xl border border-white/5 flex flex-col justify-center">
                        <label className="block text-sm font-medium text-slate-400 mb-1">Nombre de la Sucursal</label>
                        <div className="text-white font-bold text-lg tracking-wide">{data.barberia.nombre}</div>
                        <p className="text-xs text-slate-500 mt-2">Se usa el mismo nombre que tu marca al ser única sucursal.</p>
                    </div>
                )}

                <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-300 mb-1">Celular de Sucursal</label>
                    <motion.input
                        name="telefono"
                        value={data.sucursal.telefono}
                        onChange={handleChange}
                        placeholder="+598 99 123 456"
                        whileFocus={inputFocus}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500 transition-all placeholder-slate-600"
                    />
                </div>

                <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-300 mb-1">Dirección</label>
                    <motion.input
                        name="direccion"
                        value={data.sucursal.direccion}
                        onChange={handleChange}
                        placeholder="Av. Principal 1234"
                        whileFocus={inputFocus}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500 transition-all placeholder-slate-600"
                    />
                </div>

                <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-300 mb-1">Ciudad</label>
                    <motion.input
                        name="ciudad"
                        value={data.sucursal.ciudad}
                        onChange={handleChange}
                        placeholder="Montevideo"
                        whileFocus={inputFocus}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500 transition-all placeholder-slate-600"
                    />
                </div>

                <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-300 mb-1">País</label>
                    <motion.input
                        name="pais"
                        value={data.sucursal.pais}
                        onChange={handleChange}
                        placeholder="Uruguay"
                        whileFocus={inputFocus}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500 transition-all placeholder-slate-600"
                    />
                </div>

                <div className="col-span-1 md:col-span-2 space-y-1">
                    <label className="block text-sm font-medium text-slate-300 mb-1">Información Adicional (IA)</label>
                    <motion.textarea
                        name="info_adicional"
                        value={data.sucursal.info_adicional}
                        onChange={handleChange}
                        rows={2}
                        placeholder="Detalles sobre estacionamiento, referencias, etc."
                        whileFocus={inputFocus}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500 resize-none transition-all placeholder-slate-600"
                    />
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <button
                    onClick={onBack}
                    className="px-6 py-2 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                    Atrás
                </button>
                <motion.button
                    onClick={onNext}
                    disabled={!isValid}
                    whileHover={isValid ? { scale: 1.05 } : {}}
                    whileTap={isValid ? { scale: 0.95 } : {}}
                    className={`
                        px-8 py-2.5 rounded-xl font-bold transition-all duration-300 shadow-lg
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
