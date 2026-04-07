"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { hashPassword } from "@/lib/password";
import { cookies } from "next/headers";
import crypto from "crypto";
import { OnboardingData } from "@/components/onboarding/OnboardingWizard";

// ============================================================
// Verificar disponibilidad de username
// ============================================================
export async function checkUsernameAvailable(username: string): Promise<{ available: boolean }> {
    if (!username || username.length < 3) return { available: false };
    const supabase = await supabaseServer();
    const { data } = await supabase
        .from("mibarber_barberos")
        .select("id_barbero")
        .eq("username", username.trim().toLowerCase())
        .maybeSingle();
    return { available: !data };
}

// ============================================================
// Polling: verificar si el grupo de notificaciones fue creado
// (se llena cuando n8n/bot recibe el código NOTIF-xxx)
// ============================================================
export async function pollSucursalGroupReady(sucursalId: string): Promise<{ ready: boolean }> {
    const supabase = await supabaseServer();
    const { data } = await supabase
        .from("mibarber_sucursales")
        .select("grupo_not_desactivar")
        .eq("id", sucursalId)
        .maybeSingle();
    return { ready: !!data?.grupo_not_desactivar };
}

// ============================================================
// Polling: verificar si TODOS los barberos tienen id_conv_barbero
// (cada barbero manda ADMIN-xxx al WhatsApp de la sucursal)
// ============================================================
export async function pollBarberConvReady(sucursalId: string): Promise<{ ready: boolean; total: number; verified: number; barbers: { nombre: string; verified: boolean }[] }> {
    const supabase = await supabaseServer();
    const { data } = await supabase
        .from("mibarber_barberos")
        .select("nombre, id_conv_barbero")
        .eq("id_sucursal", sucursalId);
    if (!data || data.length === 0) return { ready: false, total: 0, verified: 0, barbers: [] };
    const barbers = data.map((b: any) => ({ nombre: b.nombre, verified: !!b.id_conv_barbero }));
    const verified = barbers.filter((b: any) => b.verified).length;
    return { ready: verified === barbers.length, total: barbers.length, verified, barbers };
}

// ============================================================
// Activar sucursal: marcar activa = true
// ============================================================
export async function activateSucursal(sucursalId: string): Promise<{ success: boolean }> {
    const supabase = await supabaseServer();
    const { error } = await supabase
        .from("mibarber_sucursales")
        .update({ activa: true })
        .eq("id", sucursalId);
    if (error) console.error("Error activando sucursal:", error.message);
    return { success: !error };
}

// ============================================================
// Polling del QR desde Evolution API (el frontend lo llama)
// ============================================================
export async function getInstanceQR(instanceName: string): Promise<{ qrCode: string | null; connected: boolean }> {
    const evoApiUrl = process.env.EVOLUTION_API_URL || "https://evolutioncodexa.codexa.uy";
    const evoApiKey = (process.env.EVOLUTION_GLOBAL_API_KEY || "").trim();

    try {
        // Primero chequeamos el estado de conexión
        const statusRes = await fetch(`${evoApiUrl}/instance/connectionState/${instanceName}`, {
            headers: { "apikey": evoApiKey }
        });
        if (statusRes.ok) {
            const statusData = await statusRes.json();
            const state = statusData?.instance?.state || statusData?.state || "";
            if (state === "open") {
                return { qrCode: null, connected: true };
            }
        }

        // Si no está conectado, pedimos QR fresco
        const qrRes = await fetch(`${evoApiUrl}/instance/connect/${instanceName}`, {
            headers: { "apikey": evoApiKey }
        });
        if (qrRes.ok) {
            const qrData = await qrRes.json();
            const base64 = qrData?.base64 || qrData?.qrcode?.base64 || null;
            return { qrCode: base64, connected: false };
        }

        return { qrCode: null, connected: false };
    } catch (err) {
        console.error("[getInstanceQR] Error:", err);
        return { qrCode: null, connected: false };
    }
}

// ============================================================
// Onboarding principal
// ============================================================
export async function submitOnboardingData(data: OnboardingData) {
    const supabase = await supabaseServer();
    const cookieStore = await cookies();
    const branchIndex = data.currentBranchIndex || 0;

    try {
        console.log(`--- Iniciando Onboarding para Rama ${branchIndex} ---`);
        
        // ---- 1. Generar nombres únicos ----
        const cleanName = data.barberia.nombre.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const randomSuffix = crypto.randomBytes(2).toString('hex');
        const instanceName = `${cleanName}-${branchIndex + 1}-${randomSuffix}`;
        const instanceToken = crypto.randomBytes(4).toString('hex');

        const evoApiUrl = process.env.EVOLUTION_API_URL || "https://evolutioncodexa.codexa.uy";
        const evoApiKey = (process.env.EVOLUTION_GLOBAL_API_KEY || "").trim();
        const chatwootUrl = process.env.CHATWOOT_URL || "https://chatwootcodexa.codexa.uy";
        const chatwootAccountId = process.env.CHATWOOT_ACCOUNT_ID || "1";
        const chatwootToken = process.env.CHATWOOT_USER_TOKEN || "";
        const inboxName = data.branchCount > 1
            ? `${data.barberia.nombre} - ${data.sucursales[branchIndex]?.nombre || 'Sucursal'}`
            : data.barberia.nombre;

        // ---- 2. Crear instancia en Evolution API (sin esperar QR) ----
        console.log(`[1/4] Creando instancia Evolution: ${instanceName}`);
        const createRes = await fetch(`${evoApiUrl}/instance/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "apikey": evoApiKey },
            body: JSON.stringify({
                instanceName,
                token: instanceToken,
                qrcode: false,               // No necesitamos QR aquí
                integration: "WHATSAPP-BAILEYS"
            })
        });

        if (!createRes.ok) {
            const errText = await createRes.text();
            console.error(`Error Evolution API (${createRes.status}):`, errText);
            throw new Error(`Error Evolution API (${createRes.status}): ${errText}`);
        }
        console.log(`[1/4] ✅ Instancia creada: ${instanceName}`);

        // ---- 3. Configurar Chatwoot INMEDIATAMENTE ----
        let chatwootInboxUrl: string | null = null;
        let chatwootInboxId: number | null = null;

        if (chatwootToken) {
            console.log(`[2/4] Configurando Chatwoot para: ${instanceName}`);
            const setChatwootRes = await fetch(`${evoApiUrl}/chatwoot/set/${instanceName}`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "apikey": evoApiKey },
                body: JSON.stringify({
                    enabled: true,
                    url: chatwootUrl,
                    accountId: chatwootAccountId,
                    token: chatwootToken,
                    signMsg: false,
                    reopenConversation: false,
                    conversationPending: false,
                    importContacts: false,
                    autoCreate: true,
                    nameInbox: inboxName
                })
            });

            if (setChatwootRes.ok) {
                console.log(`[2/4] ✅ Chatwoot configurado`);
                chatwootInboxUrl = `${chatwootUrl}/app/accounts/${chatwootAccountId}/settings/inboxes/list`;

                // Obtener inbox_id de Chatwoot API
                try {
                    const inboxesRes = await fetch(
                        `${chatwootUrl}/api/v1/accounts/${chatwootAccountId}/inboxes`,
                        { headers: { "api_access_token": chatwootToken } }
                    );
                    if (inboxesRes.ok) {
                        const inboxesData = await inboxesRes.json();
                        const inboxes = inboxesData?.payload || inboxesData || [];
                        // Buscar por nombre de inbox
                        const found = inboxes.find((inbox: any) => inbox.name === inboxName);
                        if (found) {
                            chatwootInboxId = found.id;
                            console.log(`[2/4] ✅ Inbox ID encontrado: ${chatwootInboxId}`);
                        } else {
                            console.warn(`[2/4] ⚠️ No se encontró inbox con nombre: ${inboxName}`);
                        }
                    }
                } catch (inboxErr) {
                    console.warn(`[2/4] ⚠️ Error obteniendo inbox_id:`, inboxErr);
                }
            } else {
                const cwErr = await setChatwootRes.text();
                console.warn(`[2/4] ⚠️ Chatwoot falló (continuando): ${cwErr}`);
            }
        }

        // ---- 4. Base de datos ----
        console.log(`[3/4] Guardando en base de datos...`);

        let barberiaId: string | null = null;
        const currentSucData = data.sucursales[branchIndex];
        if (!currentSucData) throw new Error(`Datos de sucursal ${branchIndex} no encontrados.`);

        const { data: existingBarberia } = await supabase
            .from("mibarber_barberias")
            .select("id")
            .eq("nombre_barberia", data.barberia.nombre)
            .maybeSingle();

        if (!existingBarberia) {
            const { data: newBarberia, error: barberiaError } = await supabase
                .from("mibarber_barberias")
                .insert({ 
                    nombre_barberia: data.barberia.nombre,
                    pais: currentSucData.pais,
                    ciudad: currentSucData.ciudad,
                    cod_pais: currentSucData.cod_pais
                })
                .select()
                .single();
            if (barberiaError) throw new Error(`Error creando barbería: ${barberiaError.message}`);
            barberiaId = newBarberia.id;
        } else {
            // Actualizar campos si ya existe
            const { error: updateError } = await supabase
                .from("mibarber_barberias")
                .update({
                    pais: currentSucData.pais,
                    ciudad: currentSucData.ciudad,
                    cod_pais: currentSucData.cod_pais
                })
                .eq("id", existingBarberia.id);
            if (updateError) console.error("Error actualizando barbería:", updateError);
            barberiaId = existingBarberia.id;
        }

        const { data: sucursal, error: sucursalError } = await supabase
            .from("mibarber_sucursales")
            .insert({
                id_barberia: barberiaId,
                numero_sucursal: branchIndex + 1,
                nombre_sucursal: currentSucData.nombre,
                direccion: currentSucData.direccion,
                telefono: currentSucData.telefono,
                info: currentSucData.info_adicional,
                inbox: chatwootInboxId
            })
            .select()
            .single();

        if (sucursalError) throw new Error(`Error creando sucursal: ${sucursalError.message}`);
        const sucursalId = sucursal.id;

        // Servicios
        const branchContext = (data as any).branchContext?.[branchIndex];
        const detailedServices = branchContext?.detailedServices || [];
        
        let dbServices: any[] = [];
        if (detailedServices.length > 0) {
            const servicesToInsert = detailedServices.map((s: any) => ({
                id_barberia: barberiaId,
                id_sucursal: sucursalId,
                nombre: s.nombre,
                duracion_minutos: s.duracion,
                precio: s.precio,
                activo: true
            }));
            const { data: insertedServices, error: servicesError } = await supabase
                .from("mibarber_servicios")
                .insert(servicesToInsert)
                .select();
            
            if (servicesError) console.error(`Error servicios:`, servicesError);
            dbServices = insertedServices || [];
        }

        // Barberos
        const branchBarbers = data.barberosPorSucursal[branchIndex] || [];
        for (let j = 0; j < branchBarbers.length; j++) {
            const barb = branchBarbers[j];
            const isFirstAdmin = branchIndex === 0 && j === 0;
            // Use explicit isAdmin flag if available, otherwise default to isFirstAdmin
            const isAdmin = (barb as any).isAdmin !== undefined ? (barb as any).isAdmin : isFirstAdmin;
            const hashedPassword = isAdmin ? await hashPassword(data.adminBarber.password) : null;
            
            // Calculate specialties (service IDs) for this barber
            const barberServiceNames = data.asignacionesPorSucursal[branchIndex]?.[j] || [];
            const especialidades = dbServices
                .filter((s: any) => barberServiceNames.includes(s.nombre))
                .map((s: any) => s.id_servicio); // Assuming the ID column is id_servicio based on previous code

            const { data: dbBarber, error: barberError } = await supabase
                .from("mibarber_barberos")
                .insert({
                    nombre: barb.nombre,
                    telefono: barb.telefono,
                    id_barberia: barberiaId,
                    id_sucursal: sucursalId,
                    admin: isAdmin,
                    nivel_permisos: isAdmin ? 1 : 0,
                    username: isAdmin ? data.adminBarber.usuario : null,
                    password_hash: hashedPassword,
                    email: isAdmin ? data.adminBarber.email : null,
                    especialidades: especialidades // Store as JSONB array of IDs
                })
                .select()
                .single();

            if (barberError) {
                console.error(`Error creando barbero ${barb.nombre}:`, barberError.message);
                // Continue with other barbers even if one fails
                continue;
            }
        }

        // Horarios (desde editor interactivo)
        const scheduleFromUI: any[] = (currentSucData as any).scheduleData || [];
        
        let schedulesToInsert: any[] = [];
        if (scheduleFromUI.length > 0) {
            schedulesToInsert = scheduleFromUI
                .filter((d: any) => d.activo)
                .map((d: any) => ({
                    id_sucursal: sucursalId,
                    id_dia: d.id,
                    hora_apertura: d.apertura ? `${d.apertura}:00` : "09:00:00",
                    hora_cierre: d.cierre ? `${d.cierre}:00` : "20:00:00",
                    hora_inicio_almuerzo: d.almuerzo && d.almuerzoInicio ? `${d.almuerzoInicio}:00` : null,
                    hora_fin_almuerzo: d.almuerzo && d.almuerzoFin ? `${d.almuerzoFin}:00` : null,
                    activo: true
                }));
        } else {
            // Fallback: Lun-Sáb default
            schedulesToInsert = [1, 2, 3, 4, 5, 6].map(dayId => ({
                id_sucursal: sucursalId,
                id_dia: dayId,
                hora_apertura: "09:00:00",
                hora_cierre: "20:00:00",
                hora_inicio_almuerzo: null,
                hora_fin_almuerzo: null,
                activo: true
            }));
        }

        if (schedulesToInsert.length > 0) {
            const { error: scheduleError } = await supabase
                .from("mibarber_horarios_sucursales")
                .insert(schedulesToInsert);
            if (scheduleError) console.error("Error al insertar horarios:", scheduleError);
        }

        console.log(`[3/4] ✅ Base de datos lista`);

        // ---- 5. Sesión del admin (solo en la primera sucursal) ----
        if (branchIndex === 0) {
            const { data: finalAdmin } = await supabase
                .from("mibarber_barberos")
                .select('*')
                .eq('id_barberia', barberiaId)
                .eq('admin', true)
                .maybeSingle();

            if (!finalAdmin) {
                throw new Error("No se pudo crear el administrador. El nombre de usuario ya existe en el sistema. Elegí otro nombre de usuario.");
            }

            const session = {
                user: {
                    id: finalAdmin.id_barbero, email: finalAdmin.email, name: finalAdmin.nombre,
                    username: finalAdmin.username, nivel_permisos: 1, admin: true,
                    id_barberia: barberiaId, id_sucursal: sucursalId,
                },
                instanceName,
                expiresAt: Date.now() + 24 * 60 * 60 * 1000,
            };

            cookieStore.set("barber_auth_session", JSON.stringify(session), {
                path: "/", maxAge: 60 * 60 * 24, sameSite: "lax", secure: process.env.NODE_ENV === "production"
            });

            console.log(`[4/4] ✅ Sesión creada. Listo.`);
            return { success: true, session, instanceName, chatwootInboxUrl, sucursalId };
        }

        console.log(`[4/4] ✅ Rama ${branchIndex} lista.`);
        return { success: true, instanceName, chatwootInboxUrl, sucursalId };

    } catch (error: any) {
        console.error("Error en onboarding:", error);
        return { success: false, error: error.message };
    }
}
