"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import WelcomeStep from "./steps/WelcomeStep";
import BarberiaStep from "./steps/BarberiaStep";
import BranchCountStep from "./steps/BranchCountStep";
import SucursalStep from "./steps/SucursalStep";
import HorariosStep from "./steps/HorariosStep";
import AdminBarberStep from "./steps/AdminBarberStep";
import TeamStep from "./steps/TeamStep";
import ServicesStep from "./steps/ServicesStep";
import AssignmentStep from "./steps/AssignmentStep";
import ActivationStep from "./steps/ActivationStep";

// Helper types
export type SucursalData = {
    internalId: string; // To track in array
    nombre: string;
    apodo: string; // Nickname if > 1 branch
    telefono: string;
    direccion: string;
    ciudad: string;
    pais: string;
    info_adicional: string;
    horarios: any[];
};

export type OnboardingData = {
    branchCount: number;
    currentBranchIndex: number;
    barberia: {
        nombre: string;
    };
    // Array of branches
    sucursales: SucursalData[];

    adminBarber: {
        nombre: string;
        celular: string;
        email: string;
        usuario: string;
        password: string;
    };

    barberosPorSucursal: Record<number, any[]>;

    servicios: any[]; // Global services catalog

    // Assignments: Record<BranchIndex, Record<BarberId, ServiceIds[]>>
    asignacionesPorSucursal: Record<number, Record<string, string[]>>;

    // Active helpers (synced with index 0 initially)
    sucursal: SucursalData; // Defines the "current" one being edited (helper)
    barberos: any[]; // Current branch barbers helper
    asignaciones: Record<string, string[]>; // Current branch assignments helper
};

const INITIAL_SUCURSAL: SucursalData = {
    internalId: "1",
    nombre: "",
    apodo: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    pais: "",
    info_adicional: "",
    horarios: []
};

const INITIAL_DATA: OnboardingData = {
    branchCount: 1,
    currentBranchIndex: 0,
    barberia: { nombre: "" },
    sucursales: [{ ...INITIAL_SUCURSAL }],
    adminBarber: {
        nombre: "",
        celular: "",
        email: "",
        usuario: "",
        password: "",
    },
    barberosPorSucursal: { 0: [] },
    servicios: [],
    asignacionesPorSucursal: { 0: {} },

    // Active helpers (synced with index 0 initially)
    sucursal: { ...INITIAL_SUCURSAL },
    barberos: [],
    asignaciones: {}
};

export default function OnboardingWizard() {
    const [step, setStep] = useState(0);
    const [data, setData] = useState<OnboardingData>(INITIAL_DATA);

    const updateData = (key: keyof OnboardingData, value: any) => {
        setData((prev) => {
            const next = { ...prev, [key]: value };

            // If updating a helper, sync back to source of truth
            if (key === 'sucursal') {
                const list = [...prev.sucursales];
                list[prev.currentBranchIndex] = value;
                next.sucursales = list;
            }
            if (key === 'barberos') {
                next.barberosPorSucursal = {
                    ...prev.barberosPorSucursal,
                    [prev.currentBranchIndex]: value
                };
            }
            if (key === 'asignaciones') {
                next.asignacionesPorSucursal = {
                    ...prev.asignacionesPorSucursal,
                    [prev.currentBranchIndex]: value
                };
            }

            // Logic for branch count change
            if (key === 'branchCount') {
                const newCount = value as number;
                const currentList = [...prev.sucursales];
                if (newCount > currentList.length) {
                    for (let i = currentList.length; i < newCount; i++) {
                        currentList.push({ ...INITIAL_SUCURSAL, internalId: (i + 1).toString() });
                    }
                }
                next.sucursales = currentList;
            }

            return next;
        });
    };

    // LOGIC TO ADVANCE STEPS
    // 0: Welcome
    // 1: Barberia
    // 2: Branch Count
    // 3: Services (Global)
    // 4: Admin (Global)

    // LOOP START
    // 5: Branch Details (SucursalStep)
    // 6: Hours
    // 7: Team
    // 8: Assignments

    // Activation

    const GLOBAL_PRE_STEPS = 5;
    const STEPS_PER_BRANCH = 4;

    const totalSteps = GLOBAL_PRE_STEPS + (data.branchCount * STEPS_PER_BRANCH) + 1; // +1 for Activation

    const getCurrentComponent = () => {
        if (step === 0) return <WelcomeStep onNext={nextStep} />;
        if (step === 1) return <BarberiaStep data={data} updateData={updateData} onNext={nextStep} />;
        if (step === 2) return <BranchCountStep data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />;
        if (step === 3) return <ServicesStep data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />;
        if (step === 4) return <AdminBarberStep data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />;

        const loopStepIndex = step - GLOBAL_PRE_STEPS;
        // If we are in the loop
        if (loopStepIndex >= 0 && loopStepIndex < (data.branchCount * STEPS_PER_BRANCH)) {
            const branchIdx = Math.floor(loopStepIndex / STEPS_PER_BRANCH);
            const substep = loopStepIndex % STEPS_PER_BRANCH;

            const viewData = {
                ...data,
                currentBranchIndex: branchIdx,
                sucursal: data.sucursales[branchIdx] || INITIAL_SUCURSAL,
                barberos: data.barberosPorSucursal[branchIdx] || [],
                asignaciones: data.asignacionesPorSucursal[branchIdx] || {}
            };

            const viewUpdateData = (key: keyof OnboardingData, value: any) => {
                if (key === 'branchCount' || key === 'barberia' || key === 'servicios' || key === 'adminBarber') {
                    updateData(key, value);
                    return;
                }

                setData(prev => {
                    const next = { ...prev };
                    if (key === 'sucursal') {
                        const list = [...prev.sucursales];
                        list[branchIdx] = value;
                        next.sucursales = list;
                    } else if (key === 'barberos') {
                        next.barberosPorSucursal = { ...prev.barberosPorSucursal, [branchIdx]: value };
                    } else if (key === 'asignaciones') {
                        next.asignacionesPorSucursal = { ...prev.asignacionesPorSucursal, [branchIdx]: value };
                    }
                    return next;
                });
            };

            if (substep === 0) return <SucursalStep data={viewData} updateData={viewUpdateData} onNext={nextStep} onBack={prevStep} />;
            if (substep === 1) return <HorariosStep data={viewData} updateData={viewUpdateData} onNext={nextStep} onBack={prevStep} />;
            if (substep === 2) return <TeamStep data={viewData} updateData={viewUpdateData} onNext={nextStep} onBack={prevStep} />;
            if (substep === 3) return <AssignmentStep data={viewData} updateData={viewUpdateData} onNext={nextStep} onBack={prevStep} />;
        }

        return <ActivationStep data={data} onBack={prevStep} />;
    };

    const nextStep = () => {
        setStep(prev => prev + 1);
        window.scrollTo(0, 0);
    };
    const prevStep = () => {
        setStep(prev => Math.max(0, prev - 1));
        window.scrollTo(0, 0);
    };

    // Titles
    const getStepTitle = () => {
        if (step === 0) return "";
        if (step === 1) return "Tu Marca";
        if (step === 2) return "Sucursales";
        if (step === 3) return "Servicios Globales";
        if (step === 4) return "Administrador";

        const loopStepIndex = step - GLOBAL_PRE_STEPS;
        if (loopStepIndex >= 0 && loopStepIndex < (data.branchCount * STEPS_PER_BRANCH)) {
            const branchIdx = Math.floor(loopStepIndex / STEPS_PER_BRANCH);
            return `Sucursal ${branchIdx + 1} de ${data.branchCount}`;
        }

        return "Activación";
    };

    // Animation variants
    const pageVariants = {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    const pageTransition = {
        ease: [0.42, 0, 0.58, 1] as const, // easeInOut cubic-bezier
        duration: 0.5
    };

    return (
        <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">

            {/* Background Ambient Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-900/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-2xl relative z-10">
                {/* Progress Bar */}
                {step > 0 && (
                    <div className="mb-8">
                        <div className="flex justify-between text-sm text-slate-400 mb-2 font-medium">
                            <span>Paso {step} de {totalSteps}</span>
                            <span>{Math.round((step / totalSteps) * 100)}% completado</span>
                        </div>
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400 shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${((step) / (totalSteps - 1)) * 100}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                        </div>
                    </div>
                )}

                <div className={`
                    relative backdrop-blur-xl bg-[#0f172a]/60 border border-white/10 shadow-2xl shadow-black/50 overflow-hidden transition-all duration-700
                    ${step === 0 ? 'rounded-3xl' : 'rounded-2xl'}
                `}>
                    {/* Header - Hide on Welcome Screen */}
                    {step > 0 && (
                        <div className="p-4 md:p-6 border-b border-white/5 bg-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <AnimatePresence mode="wait">
                                    <motion.h1
                                        key={getStepTitle()}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        transition={{ duration: 0.3 }}
                                        className="text-2xl font-bold text-white tracking-wide"
                                    >
                                        {getStepTitle()}
                                    </motion.h1>
                                </AnimatePresence>
                                <span className="text-sm text-slate-500 font-mono">
                                    {Math.min(step, totalSteps - 1)} / {totalSteps - 1}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className={step === 0 ? "" : "p-4 md:p-6"}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                variants={pageVariants}
                                transition={pageTransition}
                                className="w-full"
                            >
                                {getCurrentComponent()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
