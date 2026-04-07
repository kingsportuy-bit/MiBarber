"use client";

import './onboarding.css';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitOnboardingData, getInstanceQR, checkUsernameAvailable, pollSucursalGroupReady, pollBarberConvReady, activateSucursal } from "@/lib/actions/onboarding";
import { OnboardingData, SucursalData } from "./OnboardingWizard";
import { ArrowPathIcon, ExclamationTriangleIcon, ArrowRightIcon, CheckCircleIcon, ChatBubbleLeftRightIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

// ========================
// Constantes
// ========================

const COUNTRY_CODES: { name: string; code: string; iso: string; pattern: RegExp }[] = [
    { name: "Uruguay", code: "+598", iso: "uy", pattern: /^9\d{7}$/ },
    { name: "Argentina", code: "+54", iso: "ar", pattern: /^9\d{8}$/ },
    { name: "Colombia", code: "+57", iso: "co", pattern: /^3\d{9}$/ },
    { name: "México", code: "+52", iso: "mx", pattern: /^[1-9]\d{9}$/ },
    { name: "Chile", code: "+56", iso: "cl", pattern: /^9\d{8}$/ },
    { name: "Perú", code: "+51", iso: "pe", pattern: /^9\d{8}$/ },
    { name: "Brasil", code: "+55", iso: "br", pattern: /^9\d{9}$/ },
    { name: "Ecuador", code: "+593", iso: "ec", pattern: /^9\d{8}$/ },
    { name: "Paraguay", code: "+595", iso: "py", pattern: /^9\d{8}$/ },
    { name: "Venezuela", code: "+58", iso: "ve", pattern: /^4\d{9}$/ },
    { name: "España", code: "+34", iso: "es", pattern: /^[6-9]\d{8}$/ },
    { name: "Estados Unidos", code: "+1", iso: "us", pattern: /^[2-9]\d{9}$/ },
    { name: "Canadá", code: "+1", iso: "ca", pattern: /^[2-9]\d{9}$/ },
    { name: "Portugal", code: "+351", iso: "pt", pattern: /^9\d{8}$/ },
    { name: "Italia", code: "+39", iso: "it", pattern: /^3\d{9}$/ },
    { name: "Francia", code: "+33", iso: "fr", pattern: /^[6-7]\d{8}$/ },
    { name: "Alemania", code: "+49", iso: "de", pattern: /^1[5-9]\d{8,9}$/ },
    { name: "Reino Unido", code: "+44", iso: "gb", pattern: /^7\d{9}$/ },
    { name: "Australia", code: "+61", iso: "au", pattern: /^4\d{8}$/ },
    { name: "Costa Rica", code: "+506", iso: "cr", pattern: /^8\d{7}$/ },
    { name: "Panamá", code: "+507", iso: "pa", pattern: /^6\d{7}$/ },
    { name: "Rep. Dominicana", code: "+1", iso: "do", pattern: /^5\d{9}$/ },
    { name: "Guatemala", code: "+502", iso: "gt", pattern: /^4\d{7}$/ },
    { name: "El Salvador", code: "+503", iso: "sv", pattern: /^6\d{7}$/ },
    { name: "Honduras", code: "+504", iso: "hn", pattern: /^8\d{7}$/ },
    { name: "Nicaragua", code: "+505", iso: "ni", pattern: /^8\d{7}$/ },
    { name: "Cuba", code: "+53", iso: "cu", pattern: /^5\d{7}$/ },
    { name: "Puerto Rico", code: "+1", iso: "pr", pattern: /^[3-9]\d{8}$/ },
];

const DAYS = [
    { id: 1, name: "Lunes", short: "Lun" },
    { id: 2, name: "Martes", short: "Mar" },
    { id: 3, name: "Miércoles", short: "Mié" },
    { id: 4, name: "Jueves", short: "Jue" },
    { id: 5, name: "Viernes", short: "Vie" },
    { id: 6, name: "Sábado", short: "Sáb" },
    { id: 7, name: "Domingo", short: "Dom" },
];

const INITIAL_SUCURSAL: SucursalData = {
    internalId: "", nombre: "", apodo: "", telefono: "", direccion: "", ciudad: "", pais: "", cod_pais: "", info_adicional: "", horarios: []
};

const INITIAL_DATA: OnboardingData = {
    branchCount: 1, currentBranchIndex: 0,
    barberia: { nombre: "", telefono: "" },
    sucursales: [],
    adminBarber: { nombre: "", celular: "", email: "", usuario: "", password: "" },
    barberosPorSucursal: {},
    servicios: [],
    asignacionesPorSucursal: {},
    sucursal: { ...INITIAL_SUCURSAL },
    barberos: [],
    asignaciones: {}
};

interface ServiceItem { nombre: string; descripcion: string; duracion: number; precio: number; }
interface DaySchedule { id: number; activo: boolean; apertura: string; cierre: string; almuerzo: boolean; almuerzoInicio: string; almuerzoFin: string; }
interface BarberItem { nombre: string; telefono: string; isAdmin?: boolean; }

type SubPhase = 'welcome' | 'general' | 'branch' | 'scheduleEditor' | 'serviceEditor' | 'barber' | 'barberServices' | 'addMoreBarber' | 'activating' | 'qr' | 'verification' | 'done' | 'error';

interface Question {
    key: string;
    prompt: string;
    placeholder: string;
    type?: 'text' | 'number' | 'email' | 'password' | 'tel' | 'selection' | 'country' | 'branchSelector' | 'yesno';
}

// ========================
// Componente Principal
// ========================

export default function ConversationalOnboarding() {
    const [phase, setPhase] = useState<SubPhase>('welcome');
    const [stepIndex, setStepIndex] = useState(0);
    const [branchIndex, setBranchIndex] = useState(0);
    const [barberIndex, setBarberIndex] = useState(0);

    const [input, setInput] = useState("");
    const [data, setData] = useState<OnboardingData>(INITIAL_DATA);
    const [countryCode, setCountryCode] = useState("+598");

    // Editores interactivos
    const [scheduleData, setScheduleData] = useState<DaySchedule[]>(
        DAYS.map(d => ({ id: d.id, activo: d.id <= 6, apertura: "09:00", cierre: "20:00", almuerzo: false, almuerzoInicio: "13:00", almuerzoFin: "14:00" }))
    );
    const [services, setServices] = useState<ServiceItem[]>([{ nombre: "", descripcion: "", duracion: 60, precio: 0 }]);
    const [selectedServices, setSelectedServices] = useState<boolean[]>([]);

    const [qrCode, setQrCode] = useState<string | null>(null);
    const [instanceName, setInstanceName] = useState<string | null>(null);
    const [sucursalId, setSucursalId] = useState<string | null>(null);
    const [chatwootInboxUrl, setChatwootInboxUrl] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [verificationStep, setVerificationStep] = useState<1 | 2>(1);
    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
    const [barberVerificationStatus, setBarberVerificationStatus] = useState<{ nombre: string; verified: boolean }[]>([]);

    const inputRef = useRef<HTMLInputElement>(null);
    const [countrySearch, setCountrySearch] = useState("");

    // ========================
    // Preguntas dinámicas
    // ========================

    const getQuestions = (): Question[] => {
        if (phase === 'general') {
            return [
                { key: "pais", prompt: "¿De qué país sos?", placeholder: "Uruguay, Argentina, Colombia, etc", type: 'country' },
                { key: "ciudad", prompt: "¿En qué ciudad estás?", placeholder: "Ej: Montevideo" },
                { key: "adminNombre", prompt: "¿Cómo te llamás?", placeholder: "Nombre y apellido" },
                { key: "barberiaNombre", prompt: "¿Nombre de tu barbería?", placeholder: "Ej: Barbería 412" },
                { key: "adminEmail", prompt: "¿Tu email?", placeholder: "tuemail@mail.com", type: 'email' },
                { key: "adminUser", prompt: "Nombre de usuario", placeholder: "Ej: nombre_usuario" },
                { key: "adminPass", prompt: "Contraseña", placeholder: "Al menos 6 caracteres", type: 'password' },
            ];
        }
        if (phase === 'branch') {
            const q: Question[] = [];
            q.push(
                { key: "sucWpp", prompt: "¿WhatsApp de tu sucursal?", placeholder: "Ej: 099123456", type: 'tel' },
                { key: "sucDir", prompt: "¿Dirección?", placeholder: "Calle y número" },
            );
            return q;
        }
        if (phase === 'barber') {
            const isFirst = branchIndex === 0 && barberIndex === 0;
            const barberName = data.barberosPorSucursal[branchIndex]?.[barberIndex]?.nombre || "";
            const display = isFirst ? "tu" : (barberName || `Barbero ${barberIndex + 1}`);
            const q: Question[] = [];
            
            if (!isFirst) {
                q.push({ key: "barbNombre", prompt: "¿Cómo se llama el barbero?", placeholder: "Nombre y apellido" });
            }
            q.push({ key: "barbTel", prompt: isFirst ? "Ahora ingresa tu teléfono" : `Teléfono de ${display}`, placeholder: "Ej: 099123456", type: 'tel' });
            
            if (!isFirst) {
                q.push({ key: "barbIsAdmin", prompt: `¿${display} será administrador?`, placeholder: "", type: 'yesno' });
            }
            return q;
        }
        return [];
    };

    const questions = getQuestions();
    const currentQuestion = questions[stepIndex];

    useEffect(() => {
        if (currentQuestion && inputRef.current && currentQuestion.type !== 'country' && currentQuestion.type !== 'branchSelector') {
            inputRef.current.focus();
        }
    }, [currentQuestion, phase, stepIndex]);

    // Validación de username en tiempo real
    useEffect(() => {
        if (currentQuestion?.key !== 'adminUser') {
            setUsernameStatus('idle');
            return;
        }
        if (!input || input.length < 3) {
            setUsernameStatus('idle');
            return;
        }
        setUsernameStatus('checking');
        const timer = setTimeout(async () => {
            try {
                const res = await checkUsernameAvailable(input.trim());
                setUsernameStatus(res.available ? 'available' : 'taken');
            } catch {
                setUsernameStatus('idle');
            }
        }, 600);
        return () => clearTimeout(timer);
    }, [input, currentQuestion?.key]);

    // ========================
    // QR Polling
    // ========================
    useEffect(() => {
        if (phase !== 'qr' || !instanceName) return;
        let active = true;
        const pollQR = async () => {
            try {
                const result = await getInstanceQR(instanceName);
                if (!active) return;
                if (result.connected) { setPhase('verification'); return; }
                if (result.qrCode) setQrCode(result.qrCode);
            } catch (err) { console.error("Error polling QR:", err); }
        };
        pollQR();
        const interval = setInterval(pollQR, 5000);
        return () => { active = false; clearInterval(interval); };
    }, [phase, instanceName]);

    // ========================
    // Flujo
    // ========================

    const formatPhone = (phone: string) => {
        const country = COUNTRY_CODES.find(c => c.code === countryCode);
        
        let clean = phone.replace(/[\s\-\(\)\.]/g, '');
        
        if (clean.startsWith('+')) {
            clean = clean.substring(1);
        }
        
        if (clean.startsWith('00')) {
            clean = clean.substring(2);
        } else if (clean.startsWith('0')) {
            clean = clean.substring(1);
        }
        
        const codeDigits = countryCode.replace('+', '');
        if (clean.startsWith(codeDigits)) {
            clean = clean.substring(codeDigits.length);
        }
        
        for (const c of COUNTRY_CODES) {
            const cDigits = c.code.replace('+', '');
            if (clean.startsWith(cDigits) && cDigits !== codeDigits) {
                clean = clean.substring(cDigits.length);
                break;
            }
        }
        
        if (country && country.pattern.test(clean)) {
            return `${countryCode}${clean}`;
        }
        
        return `${countryCode}${clean}`;
    };

    const getPhonePlaceholder = () => {
        if (countryCode === "+598") return "099123456";
        if (countryCode === "+54") return "91123456789";
        if (countryCode === "+52") return "5512345678";
        if (countryCode === "+56") return "912345678";
        if (countryCode === "+51") return "912345678";
        if (countryCode === "+55") return "11912345678";
        if (countryCode === "+593") return "991234567";
        if (countryCode === "+595") return "991234567";
        if (countryCode === "+58") return "4121234567";
        if (countryCode === "+34") return "612345678";
        if (countryCode === "+1") return "2125551234";
        return "XXXXXXXXXX";
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const val = input.trim();
        if (!val && currentQuestion?.type !== 'country' && currentQuestion?.type !== 'branchSelector') return;
        // Bloquear si el username está en uso o verificándose
        if (currentQuestion?.key === 'adminUser' && (usernameStatus === 'taken' || usernameStatus === 'checking')) return;

        const next = { ...data };

        if (phase === 'general') {
            if (currentQuestion.key === 'pais') { /* handled by country selector */ }
            if (currentQuestion.key === 'ciudad') next.sucursal.ciudad = val;
            if (currentQuestion.key === 'adminNombre') next.adminBarber.nombre = val;
            if (currentQuestion.key === 'barberiaNombre') next.barberia.nombre = val;
            if (currentQuestion.key === 'barberiaTel') next.barberia.telefono = formatPhone(val);
            if (currentQuestion.key === 'branchCount') { /* handled by branch selector */ }
            if (currentQuestion.key === 'adminEmail') next.adminBarber.email = val;
            if (currentQuestion.key === 'adminUser') next.adminBarber.usuario = val;
            if (currentQuestion.key === 'adminPass') next.adminBarber.password = val;
        } else if (phase === 'branch') {
            if (!next.sucursales[branchIndex]) {
                next.sucursales[branchIndex] = { ...INITIAL_SUCURSAL, internalId: branchIndex.toString() };
            }
            const suc = next.sucursales[branchIndex];
            if (currentQuestion.key === 'sucNombre') suc.nombre = val;
            if (currentQuestion.key === 'sucWpp') suc.telefono = formatPhone(val);
            if (currentQuestion.key === 'sucDir') suc.direccion = val;
        } else if (phase === 'barber') {
            if (!next.barberosPorSucursal[branchIndex]) next.barberosPorSucursal[branchIndex] = [];
            const barberos = [...next.barberosPorSucursal[branchIndex]];
            const barber: BarberItem = barberos[barberIndex] || { nombre: "", telefono: "", isAdmin: false };
            
            if (currentQuestion.key === 'barbNombre') barber.nombre = val;
            if (currentQuestion.key === 'barbTel') barber.telefono = formatPhone(val);
            if (currentQuestion.key === 'barbIsAdmin') {
                // value is handled by yesno buttons, but if val is string...
                // actuallyhandleSubmit will be called by those buttons too
            }
            
            barberos[barberIndex] = barber;
            next.barberosPorSucursal = { ...next.barberosPorSucursal, [branchIndex]: barberos };
        }

        setData(next);
        setInput("");

        if (stepIndex + 1 < questions.length) {
            setStepIndex(prev => prev + 1);
        } else {
            advanceFromPhase(next);
        }
    };

    const selectCountry = (cc: typeof COUNTRY_CODES[0]) => {
        setCountryCode(cc.code);
        const next = { ...data, sucursal: { ...data.sucursal, pais: cc.name, cod_pais: cc.code } };
        setData(next);
        setInput("");
        if (stepIndex + 1 < questions.length) {
            setStepIndex(prev => prev + 1);
        }
    };

    const advanceFromPhase = (d: OnboardingData) => {
        if (phase === 'general') {
            // Pre-fill sucursal con el nombre de la barbería
            if (!d.sucursales[0]) d.sucursales[0] = { ...INITIAL_SUCURSAL, internalId: "0" };
            d.sucursales[0].nombre = d.barberia.nombre;
            // Pre-fill primer barbero
            if (!d.barberosPorSucursal[0]) d.barberosPorSucursal[0] = [];
            d.barberosPorSucursal[0][0] = { nombre: d.adminBarber.nombre, telefono: "", isAdmin: true };
            setData({ ...d });
            setPhase('branch');
            setStepIndex(0);
        } else if (phase === 'branch') {
            setPhase('scheduleEditor');
        } else if (phase === 'barber') {
            const allServs = (d as any).branchContext?.[branchIndex]?.detailedServices || [];
            setSelectedServices(allServs.map(() => false));
            setPhase('barberServices');
        }
    };

    const handleYesNoForAdmin = (isAdmin: boolean) => {
        const next = { ...data };
        const barberos = [...(next.barberosPorSucursal[branchIndex] || [])];
        const barber = { ...barberos[barberIndex], isAdmin };
        barberos[barberIndex] = barber;
        next.barberosPorSucursal[branchIndex] = barberos;
        setData(next);
        
        if (stepIndex + 1 < questions.length) {
            setStepIndex(prev => prev + 1);
        } else {
            advanceFromPhase(next);
        }
    };

    const handleScheduleDone = () => {
        const next = { ...data };
        const suc = next.sucursales[branchIndex];
        if (suc) {
            (suc as any).scheduleData = scheduleData;
        }
        setData(next);
        // Ir a servicios
        setServices([{ nombre: "", descripcion: "", duracion: 60, precio: 0 }]);
        setPhase('serviceEditor');
    };

    const handleServicesDone = () => {
        const validServices = services.filter(s => s.nombre.trim());
        const next = { ...data };
        const branchContext = (next as any).branchContext || {};
        branchContext[branchIndex] = { ...branchContext[branchIndex], detailedServices: validServices, servCount: validServices.length };
        (next as any).branchContext = branchContext;
        setData(next);
        // Ir a barberos
        setBarberIndex(0);
        setStepIndex(0);
        setPhase('barber');
    };

    const handleBarberServicesDone = () => {
        const allServs: ServiceItem[] = (data as any).branchContext?.[branchIndex]?.detailedServices || [];
        const selected = allServs.filter((_, i) => selectedServices[i]).map(s => s.nombre);
        const next = { ...data };
        const asig = { ...next.asignacionesPorSucursal };
        if (!asig[branchIndex]) asig[branchIndex] = {};
        asig[branchIndex] = { ...asig[branchIndex], [barberIndex]: selected };
        next.asignacionesPorSucursal = asig;
        setData(next);
        setPhase('addMoreBarber');
    };

    const handleAddMoreBarber = (addMore: boolean) => {
        if (addMore) {
            setBarberIndex(prev => prev + 1);
            setStepIndex(0);
            setPhase('barber');
        } else {
            triggerBranchActivation(data);
        }
    };

    const triggerBranchActivation = async (currentData: OnboardingData) => {
        setPhase('activating');
        setErrorMessage(null);
        try {
            const result = await submitOnboardingData({
                ...currentData,
                currentBranchIndex: branchIndex
            });
            if (result.success) {
                setInstanceName(result.instanceName || null);
                setSucursalId(result.sucursalId || null);
                setChatwootInboxUrl(result.chatwootInboxUrl || null);
                setQrCode(null);
                setPhase('qr');
            } else {
                throw new Error(result.error);
            }
        } catch (err: any) {
            setErrorMessage(err.message);
            setPhase('error');
        }
    };

    const handleVerificationDone = () => {
        if (branchIndex + 1 < data.branchCount) {
            setBranchIndex(prev => prev + 1);
            setBarberIndex(0);
            setStepIndex(0);
            setVerificationStep(1);
            setInstanceName(null);
            setChatwootInboxUrl(null);
            setScheduleData(DAYS.map(d => ({ id: d.id, activo: d.id <= 6, apertura: "09:00", cierre: "20:00", almuerzo: false, almuerzoInicio: "13:00", almuerzoFin: "14:00" })));
            setServices([{ nombre: "", descripcion: "", duracion: 60, precio: 0 }]);
            setPhase('branch');
        } else {
            setPhase('done');
        }
    };

    // ========================
    // Polling de DB (verificación)
    // ========================
    useEffect(() => {
        if (phase !== 'verification' || !sucursalId) return;
        let active = true;

        const poll = async () => {
            if (!active) return;
            if (verificationStep === 1) {
                // Esperar que el grupo de notificaciones sea mapeado
                const res = await pollSucursalGroupReady(sucursalId);
                if (res.ready && active) {
                    setVerificationStep(2);
                }
            } else {
                // Esperar que TODOS los barberos se mapeen via ADMIN-xxx
                const res = await pollBarberConvReady(sucursalId);
                if (active) setBarberVerificationStatus(res.barbers);
                if (res.ready && active) {
                    // Activar sucursal y redirigir al panel
                    await activateSucursal(sucursalId);
                    setPhase('done');
                }
            }
        };

        poll();
        const interval = setInterval(poll, 5000);
        return () => { active = false; clearInterval(interval); };
    }, [phase, sucursalId, verificationStep]);

    useEffect(() => {
        if (phase === 'done') {
            const timer = setTimeout(() => { window.location.href = '/inicio'; }, 2500);
            return () => clearTimeout(timer);
        }
    }, [phase]);

    // ========================
    // Renders especiales
    // ========================

    const renderCountrySelector = () => {
        const hasSearch = countrySearch.trim().length > 0;
        const filtered = hasSearch 
            ? COUNTRY_CODES.filter(cc => cc.name.toLowerCase().startsWith(countrySearch.toLowerCase().trim()))
            : [];

        return (
            <div className="w-full max-w-2xl flex flex-col items-center gap-6">
                <div className="w-full relative">
                    <input
                        type="text"
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        placeholder="Escribí el país..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-lg text-center placeholder:text-white/20 focus:outline-none focus:border-[#C5A059]/50 transition-all"
                        style={{ fontFamily: "'Rasputin', serif" }}
                        autoFocus
                    />
                </div>
                {hasSearch && (
                    <div className="country-selector-futuristic">
                        {filtered.length > 0 ? filtered.map(cc => (
                            <motion.button
                                key={`${cc.code}-${cc.name}`}
                                onClick={() => {
                                    selectCountry(cc);
                                    setCountrySearch("");
                                }}
                                className={`country-card-futuristic ${data.sucursal.pais === cc.name ? 'active' : ''}`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <img 
                                    src={`https://flagcdn.com/w80/${cc.iso}.png`} 
                                    alt={cc.name}
                                    className="country-flag-futuristic"
                                />
                                <span className="country-name-futuristic">{cc.name}</span>
                            </motion.button>
                        )) : (
                            <p className="text-white/40 text-center py-4">No se encontraron países</p>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const [expandedDay, setExpandedDay] = useState<number | null>(1);

    const renderScheduleEditor = () => (
        <motion.div key="schedule" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl flex flex-col items-center gap-6"
        >
            <h2 className="text-2xl text-white/85 font-light" style={{ fontFamily: "'Rasputin', serif" }}>
                Horarios de <span className="text-[#C5A059]">{data.sucursales[branchIndex]?.nombre || 'la sucursal'}</span>
            </h2>
            <div className="w-full space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {scheduleData.map((day, i) => {
                    const dayInfo = DAYS.find(d => d.id === day.id);
                    const isExpanded = expandedDay === day.id;
                    return (
                        <div key={day.id} className={`rounded-2xl border transition-all ${day.activo ? 'bg-white/5 border-white/10' : 'bg-white/[0.02] border-white/5 opacity-50'}`}>
                            <div className="collapsible-header" onClick={() => setExpandedDay(isExpanded ? null : day.id)}>
                                <div className="flex items-center gap-3">
                                    <span className="text-white/80 font-medium">{dayInfo?.name}</span>
                                    {day.activo && <span className="text-[10px] bg-[#C5A059]/20 text-[#C5A059] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Abierto</span>}
                                </div>
                                <div className="flex items-center gap-4">
                                    <div onClick={(e) => { e.stopPropagation(); const s = [...scheduleData]; s[i].activo = !s[i].activo; setScheduleData(s); }}
                                        className={`pill-switch ${day.activo ? 'active' : ''}`}>
                                        <span className="pill-knob" />
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-white/20 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                            
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="collapsible-content">
                                        <div className="p-4 pt-0 space-y-4">
                                            {day.activo ? (
                                                <>
                                                    <div className="flex gap-3 items-center">
                                                        <div className="flex-1">
                                                            <label className="text-white/30 text-[10px] uppercase tracking-widest mb-1 block">Abre</label>
                                                            <input type="time" value={day.apertura} onChange={e => { const s = [...scheduleData]; s[i].apertura = e.target.value; setScheduleData(s); }}
                                                                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm w-full" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-white/30 text-[10px] uppercase tracking-widest mb-1 block">Cierra</label>
                                                            <input type="time" value={day.cierre} onChange={e => { const s = [...scheduleData]; s[i].cierre = e.target.value; setScheduleData(s); }}
                                                                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm w-full" />
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-3">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-white/40 text-xs">¿Tiene horario de almuerzo?</span>
                                                            <div onClick={() => { const s = [...scheduleData]; s[i].almuerzo = !s[i].almuerzo; setScheduleData(s); }}
                                                                className={`pill-switch ${day.almuerzo ? 'active' : ''}`}>
                                                                <span className="pill-knob" />
                                                            </div>
                                                        </div>
                                                        {day.almuerzo && (
                                                            <div className="flex gap-2 items-center bg-white/[0.03] p-3 rounded-xl border border-white/5">
                                                                <input type="time" value={day.almuerzoInicio} onChange={e => { const s = [...scheduleData]; s[i].almuerzoInicio = e.target.value; setScheduleData(s); }}
                                                                    className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-xs flex-1" />
                                                                <span className="text-white/20 text-xs">a</span>
                                                                <input type="time" value={day.almuerzoFin} onChange={e => { const s = [...scheduleData]; s[i].almuerzoFin = e.target.value; setScheduleData(s); }}
                                                                    className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-xs flex-1" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            ) : (
                                                <p className="text-center py-4 text-white/20 text-xs italic">Este día la sucursal permanecerá cerrada</p>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
            <button onClick={handleScheduleDone} className="onboarding-btn-primary w-full max-w-sm justify-center">
                Continuar <ArrowRightIcon className="w-4 h-4 ml-2" />
            </button>
        </motion.div>
    );

    const [expandedService, setExpandedService] = useState<number | null>(0);

    const renderServiceEditor = () => (
        <motion.div key="services" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl flex flex-col items-center gap-6"
        >
            <h2 className="text-2xl text-white/85 font-light" style={{ fontFamily: "'Rasputin', serif" }}>
                Servicios de <span className="text-[#C5A059]">{data.sucursales[branchIndex]?.nombre || 'la sucursal'}</span>
            </h2>
            <div className="w-full space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {services.map((srv, i) => {
                    const isExpanded = expandedService === i;
                    return (
                        <div key={i} className="rounded-2xl border border-white/10 overflow-hidden bg-white/5">
                            <div className="collapsible-header" onClick={() => setExpandedService(isExpanded ? null : i)}>
                                <div className="flex items-center gap-3">
                                    <span className="text-[#C5A059] text-xs font-bold uppercase tracking-wider">#{i + 1}</span>
                                    <span className="text-white/80 font-medium">{srv.nombre || 'Nuevo Servicio'}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    {services.length > 1 && (
                                        <button onClick={(e) => { e.stopPropagation(); setServices(services.filter((_, j) => j !== i)); }}
                                            className="text-red-400/50 hover:text-red-400 transition-colors p-1">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-white/20 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="collapsible-content">
                                        <div className="p-4 pt-0 space-y-4">
                                            <div>
                                                <label className="text-white/30 text-[10px] uppercase tracking-widest mb-1 block">Nombre</label>
                                                <input value={srv.nombre} onChange={e => { const s = [...services]; s[i].nombre = e.target.value; setServices(s); }}
                                                    placeholder="Ej: Corte Degradé" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/10" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <label className="text-white/30 text-[10px] uppercase tracking-widest">Descripción</label>
                                                    <div className="group relative inline-block">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white/20 hover:text-white/40 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-white/90 text-black text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                                            Describí el servicio en detalle para que los clientes sepan qué esperar
                                                        </div>
                                                    </div>
                                                </div>
                                                <textarea value={srv.descripcion} onChange={e => { const s = [...services]; s[i].descripcion = e.target.value; setServices(s); }}
                                                    placeholder="Describe lo máximo posible: qué incluye, técnicas usadas, duración según tipo de cabello, productos utilizados, etc." rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/10 resize-none" />
                                            </div>
                                            <div className="flex gap-3">
                                                <div className="flex-1">
                                                    <label className="text-white/30 text-[10px] uppercase tracking-widest mb-1 block">Minutos</label>
                                                    <input type="number" value={srv.duracion} onChange={e => { const s = [...services]; s[i].duracion = parseInt(e.target.value) || 60; setServices(s); }}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm" />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="text-white/30 text-[10px] uppercase tracking-widest mb-1 block">Precio</label>
                                                    <input type="number" value={srv.precio || ''} onChange={e => { const s = [...services]; s[i].precio = parseFloat(e.target.value) || 0; setServices(s); }}
                                                        placeholder="0" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/10" />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
            <button onClick={() => { const newS = [...services, { nombre: "", descripcion: "", duracion: 60, precio: 0 }]; setServices(newS); setExpandedService(newS.length - 1); }}
                className="flex items-center gap-2 text-[#C5A059] text-sm hover:text-[#d4b06a] transition-colors group">
                <div className="w-6 h-6 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center group-hover:bg-[#C5A059]/20 transition-all">
                    <PlusIcon className="w-4 h-4" />
                </div>
                Agregar otro servicio
            </button>
            <button onClick={handleServicesDone} className="onboarding-btn-primary w-full max-w-sm justify-center">
                Todo listo <CheckCircleIcon className="w-4 h-4 ml-2" />
            </button>
        </motion.div>
    );

    const renderBarberServices = () => {
        const allServs: ServiceItem[] = (data as any).branchContext?.[branchIndex]?.detailedServices || [];
        const barberName = data.barberosPorSucursal[branchIndex]?.[barberIndex]?.nombre || `Barbero ${barberIndex + 1}`;
        return (
            <motion.div key="barberServices" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg flex flex-col items-center gap-6"
            >
                <h2 className="text-2xl text-white/85 font-light" style={{ fontFamily: "'Rasputin', serif" }}>
                    ¿Qué servicios ofrece <span className="text-[#C5A059]">{barberName}</span>?
                </h2>
                <div className="w-full space-y-2">
                    {allServs.map((s, i) => (
                        <button key={i} onClick={() => { const sel = [...selectedServices]; sel[i] = !sel[i]; setSelectedServices(sel); }}
                            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl border transition-all text-left
                                ${selectedServices[i]
                                    ? 'bg-[#C5A059]/10 border-[#C5A059]/40 text-white'
                                    : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                        >
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors
                                ${selectedServices[i] ? 'bg-[#C5A059] border-[#C5A059]' : 'border-white/20'}`}>
                                {selectedServices[i] && <CheckCircleIcon className="w-3 h-3 text-black" />}
                            </div>
                            <div className="flex-1">
                                <span className="text-sm font-medium">{s.nombre}</span>
                                {s.descripcion && <span className="block text-xs text-white/30">{s.descripcion}</span>}
                            </div>
                            <span className="text-xs text-white/30">{s.duracion}min • ${s.precio}</span>
                        </button>
                    ))}
                </div>
                <button onClick={handleBarberServicesDone} className="onboarding-btn-primary w-full max-w-sm justify-center">
                    Confirmar <ArrowRightIcon className="w-4 h-4 ml-2" />
                </button>
            </motion.div>
        );
    };

    const renderAddMoreBarber = () => {
        return (
            <motion.div key="addMore" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg flex flex-col items-center gap-8"
            >
                <h2 className="text-2xl text-white/85 font-light" style={{ fontFamily: "'Rasputin', serif" }}>
                    ¿Agregar otro barbero para esta sucursal?
                </h2>
                <div className="flex gap-4">
                    <button onClick={() => handleAddMoreBarber(true)}
                        className="px-8 py-4 rounded-2xl bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#C5A059] font-medium text-lg hover:bg-[#C5A059]/20 transition-all">
                        Sí
                    </button>
                    <button onClick={() => handleAddMoreBarber(false)}
                        className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-medium text-lg hover:bg-white/10 transition-all">
                        No, continuar
                    </button>
                </div>
            </motion.div>
        );
    };

    const renderVerification = () => {
        const currentSuc = data.sucursales[branchIndex];
        const allBarbers = data.barberosPorSucursal[branchIndex] || [];
        return (
            <motion.div key="verification" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center text-center gap-6 w-full max-w-2xl"
            >
                <h2 className="text-2xl font-light text-white/90" style={{ fontFamily: "'Rasputin', serif" }}>
                    ¡WhatsApp conectado para <span className="text-[#C5A059]">{currentSuc?.nombre}</span>! 🚀
                </h2>
                <p className="text-white/40 text-sm">El sistema avanza solo — seguí las instrucciones de cada paso</p>

                <div className="w-full space-y-4">
                    {/* Paso 1: Grupo de notificaciones */}
                    <div className={`rounded-2xl p-5 border transition-all ${verificationStep >= 1 ? 'bg-white/5 border-white/10' : 'opacity-40 bg-white/2 border-white/5'}`}>
                        <div className="flex items-center gap-3 mb-3">
                            {verificationStep > 1
                                ? <CheckCircleIcon className="w-5 h-5 text-emerald-400 shrink-0" />
                                : <ArrowPathIcon className="w-5 h-5 text-[#C5A059] shrink-0 animate-spin" />
                            }
                            <span className={`font-medium text-sm ${verificationStep > 1 ? 'text-emerald-400' : 'text-[#C5A059]'}`}>
                                Paso 1: Grupo de notificaciones
                                {verificationStep > 1 && ' ✓'}
                            </span>
                        </div>
                        {verificationStep === 1 && (
                            <ul className="text-left text-white/60 space-y-2 text-sm ml-8">
                                <li>1. <b className="text-white">Crea un grupo</b> desde tu número personal de WhatsApp.</li>
                                <li>2. <b className="text-white">Agrega al grupo</b> al WhatsApp de la barbería ({currentSuc?.telefono}).</li>
                                <li>3. Nombre del grupo: <b className="text-white">"Notificaciones Barberox"</b>.</li>
                                <li>4. Escribí en ese grupo el código: <b className="text-white text-base">NOTIF-{branchIndex + 101}</b>.</li>
                                <li className="text-white/30 text-xs mt-3 italic">
                                    * El sistema detectará automáticamente cuando se cree el grupo.
                                </li>
                                <li className="text-white/30 text-xs mt-2 flex items-center gap-2">
                                    <ArrowPathIcon className="w-3 h-3 animate-spin" /> Esperando confirmación automática...
                                </li>
                            </ul>
                        )}
                    </div>

                    {/* Paso 2: Verificación de barberos */}
                    <div className={`rounded-2xl p-5 border transition-all ${verificationStep >= 2 ? 'bg-white/5 border-white/10' : 'opacity-40 bg-white/2 border-white/5'}`}>
                        <div className="flex items-center gap-3 mb-3">
                            {verificationStep === 2 && barberVerificationStatus.length > 0 && barberVerificationStatus.every(b => b.verified)
                                ? <CheckCircleIcon className="w-5 h-5 text-emerald-400 shrink-0" />
                                : verificationStep === 2
                                    ? <ArrowPathIcon className="w-5 h-5 text-[#C5A059] shrink-0 animate-spin" />
                                    : <div className="w-5 h-5 rounded-full border border-white/20 shrink-0" />
                            }
                            <span className={`font-medium text-sm ${verificationStep >= 2 ? 'text-[#C5A059]' : 'text-white/30'}`}>
                                Paso 2: Conexión de barberos
                            </span>
                        </div>
                        {verificationStep === 2 && (
                            <div className="ml-8 space-y-3 text-sm text-left">
                                <p className="text-white/60">
                                    <b className="text-white">IMPORTANTE:</b> Cada barbero debe enviar un mensaje <b className="text-white">desde su propio celular</b> al número de la barbería ({currentSuc?.telefono}) con el código:
                                </p>
                                <div className="text-center py-4 bg-white/5 rounded-2xl border border-white/10 my-4">
                                    <span className="text-3xl font-bold text-white tracking-widest">ADMIN-201</span>
                                    <p className="text-[10px] text-white/20 mt-1 uppercase tracking-tighter">Todos los barberos usan el mismo código</p>
                                </div>
                                
                                <p className="text-white/40 text-xs mb-2">
                                    Estado de conexión ({barberVerificationStatus.filter(b => b.verified).length}/{allBarbers.length}):
                                    {barberVerificationStatus.length > 0 && barberVerificationStatus.filter(b => !b.verified).length > 0 && (
                                        <span className="ml-2 text-[#C5A059]">
                                            Esperando: {barberVerificationStatus.filter(b => !b.verified).map(b => b.nombre).join(', ')}
                                        </span>
                                    )}
                                </p>
                                <div className="space-y-2">
                                    {(barberVerificationStatus.length > 0 ? barberVerificationStatus : allBarbers.map(b => ({ nombre: b.nombre, verified: false }))).map((barber, i) => (
                                        <div key={i} className={`verification-list-item ${barber.verified ? 'verified' : ''}`}>
                                            {barber.verified
                                                ? <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                                                : <div className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-white/10 animate-pulse" />
                                                  </div>
                                            }
                                            <span className={`text-sm ${barber.verified ? 'text-emerald-300' : 'text-white/50'}`}>
                                                {barber.nombre}
                                            </span>
                                            <span className="ml-auto text-[10px] uppercase font-bold tracking-wider">
                                                {barber.verified ? 'Listo ✓' : 'Pendiente'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[10px] text-white/20 italic mt-4">La pantalla avanzará automáticamente cuando todos estén conectados.</p>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        );
    };

    // ========================
    // Render Principal
    // ========================

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ color: '#F5F0EB', fontFamily: "'Rasputin', serif", ['--accent' as any]: '#C5A059', ['--text' as any]: '#F5F0EB', ['--bg' as any]: '#000000' }}>

            <AnimatePresence mode="wait">
                {phase === 'welcome' && (
                    <motion.div key="welcome" className="onboarding-welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <h2 className="text-2xl md:text-3xl text-white/80 mb-10" style={{ fontFamily: "'Rasputin', serif" }}>Bienvenido a</h2>
                        <img src="/logo-barberox.png" alt="Barberox" className="h-14 md:h-20 w-auto object-contain mx-auto mb-16 animate-logo-float" />
                        <button onClick={() => setPhase('general')} className="onboarding-btn-primary">
                            Empezar <ArrowRightIcon className="w-5 h-5 ml-2" />
                        </button>
                    </motion.div>
                )}

                {/* Preguntas conversacionales */}
                {(phase === 'general' || phase === 'branch' || phase === 'barber') && currentQuestion && (
                    <motion.div key={currentQuestion.key + branchIndex + barberIndex}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className="w-full max-w-2xl flex flex-col items-center text-center gap-8"
                    >
                        <h2 className="text-2xl md:text-4xl text-white/85 tracking-tight font-light" style={{ fontFamily: "'Rasputin', serif" }}>
                            {currentQuestion.prompt}
                        </h2>

                        {currentQuestion.type === 'country' && renderCountrySelector()}

                        {currentQuestion.type === 'yesno' && (
                            <div className="flex gap-4 w-full max-w-xs">
                                <button type="button" onClick={() => handleYesNoForAdmin(true)}
                                    className="flex-1 py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-bold hover:scale-105 transition-all shadow-lg">
                                    SÍ
                                </button>
                                <button type="button" onClick={() => handleYesNoForAdmin(false)}
                                    className="flex-1 py-5 rounded-2xl bg-white/10 text-white text-lg font-bold hover:bg-white/20 transition-all border border-white/20">
                                    NO
                                </button>
                            </div>
                        )}

                        {currentQuestion.type !== 'country' && currentQuestion.type !== 'branchSelector' && currentQuestion.type !== 'yesno' && (
                            <form onSubmit={handleSubmit} className="w-full max-w-xl">
                                <div className="onboarding-input-container">
                                    <input ref={inputRef} type={currentQuestion.type || 'text'} value={input}
                                        onChange={(e) => setInput(e.target.value)} placeholder={currentQuestion.type === 'tel' ? getPhonePlaceholder() : currentQuestion.placeholder}
                                        className="onboarding-input" style={{ fontFamily: "'Rasputin', serif" }} autoComplete="off" />
                                </div>
                                {currentQuestion.key === 'adminUser' && usernameStatus !== 'idle' && (
                                    <p className={`mt-2 text-sm font-medium ${
                                        usernameStatus === 'checking' ? 'text-white/40' :
                                        usernameStatus === 'available' ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                        {usernameStatus === 'checking' && '⏳ Verificando...'}
                                        {usernameStatus === 'available' && '✅ Disponible'}
                                        {usernameStatus === 'taken' && '❌ Ya está en uso, elegí otro'}
                                    </p>
                                )}
                                <p className="mt-3 text-white/20 text-xs uppercase tracking-widest">Presioná Enter</p>
                            </form>
                        )}
                    </motion.div>
                )}

                {/* Editores interactivos */}
                {phase === 'scheduleEditor' && renderScheduleEditor()}
                {phase === 'serviceEditor' && renderServiceEditor()}
                {phase === 'barberServices' && renderBarberServices()}
                {phase === 'addMoreBarber' && renderAddMoreBarber()}

                {phase === 'activating' && (
                    <motion.div key="activating" className="flex flex-col items-center gap-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <ArrowPathIcon className="w-12 h-12 text-[#C5A059] animate-spin" />
                        <h2 className="text-white/85 text-2xl font-light">Estamos activando la sucursal...</h2>
                    </motion.div>
                )}

                {phase === 'qr' && (
                    <motion.div key="qr" className="flex flex-col items-center text-center gap-6 w-full max-w-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h2 className="text-2xl font-light text-white/90" style={{ fontFamily: "'Rasputin', serif" }}>
                            Conectá <span className="text-[#C5A059]">{data.sucursales[branchIndex]?.nombre}</span>
                        </h2>
                        <div className="bg-white p-5 rounded-3xl shadow-[0_0_80px_rgba(255,255,255,0.08)]">
                            {qrCode ? (
                                <img src={qrCode} alt="WhatsApp QR" className="w-52 h-52 object-contain" />
                            ) : (
                                <div className="w-52 h-52 flex items-center justify-center bg-zinc-100 rounded-xl">
                                    <ArrowPathIcon className="w-8 h-8 text-zinc-300 animate-spin" />
                                </div>
                            )}
                        </div>
                        <p className="text-white/40 text-xs">QR se actualiza cada 5 segundos · Al escanear, avanza solo</p>
                        {chatwootInboxUrl && (
                            <a href={chatwootInboxUrl} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#C5A059] text-xs hover:bg-[#C5A059]/20 transition-colors">
                                <ChatBubbleLeftRightIcon className="w-3.5 h-3.5" /> Conectar desde Chatwoot
                            </a>
                        )}
                        <button onClick={() => setPhase('verification')} className="text-white/20 text-xs hover:text-white/40 transition-colors">
                            Ya escaneé, continuar →
                        </button>
                    </motion.div>
                )}

                {phase === 'verification' && renderVerification()}

                {phase === 'done' && (
                    <motion.div key="done" className="flex flex-col items-center gap-6" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                        <CheckCircleIcon className="w-20 h-20 text-emerald-500" />
                        <h2 className="text-white/85 text-3xl font-light">¡Todo listo!</h2>
                        <p className="text-white/40 text-sm">Redirigiendo al panel...</p>
                    </motion.div>
                )}

                {phase === 'error' && (
                    <motion.div key="error" className="flex flex-col items-center gap-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <ExclamationTriangleIcon className="w-12 h-12 text-red-500" />
                        <h2 className="text-white/85 text-2xl font-light">Ocurrió un error</h2>
                        <p className="text-red-400 text-sm max-w-md">{errorMessage}</p>
                        <button onClick={() => setPhase('branch')} className="onboarding-btn-primary">Volver a intentar</button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

