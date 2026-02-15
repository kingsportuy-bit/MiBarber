"use server";

// import { getSupabaseClient } from "@/lib/supabaseClient";
import { hashPassword } from "@/lib/password";
import { cookies } from "next/headers";
import { OnboardingData } from "@/components/onboarding/OnboardingWizard";

export async function submitOnboardingData(data: OnboardingData) {
    // const supabase = getSupabaseClient();
    const cookieStore = await cookies();

    console.log("⚠️ MOCKING ONBOARDING SUBMISSION", data);

    try {
        // MOCK DATA GENERATION
        // In a real scenario, these would come from the database inserts
        const barberiaId = "mock-barberia-id-" + Date.now();
        const sucursalId = "mock-sucursal-id-" + Date.now();
        const adminId = "mock-admin-id-" + Date.now();

        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 7. Generate Session Data
        const session = {
            user: {
                id: adminId,
                email: data.adminBarber.email,
                name: data.adminBarber.nombre,
                username: data.adminBarber.usuario,
                nivel_permisos: 1, // Admin
                admin: true,
                id_barberia: barberiaId,
                id_sucursal: sucursalId,
            },
            expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        };

        // 8. Set Cookie
        // Note: In Next.js Server Actions, we can set cookies directly
        cookieStore.set("barber_auth_session", JSON.stringify(session), {
            path: "/",
            maxAge: 60 * 60 * 24, // 1 day
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
        });

        // --------------------------------------------------------------------------
        // ORIGINAL LOGIC COMMENTED OUT TO AVOID CLIENT/SERVER ERROR DURING PROTOTYPE
        // --------------------------------------------------------------------------
        /*
        // 1. Create Barberia
        const { data: barberia, error: barberiaError } = await (supabase as any)
            .from("mibarber_barberias")
            .insert({
                nombre_barberia: data.barberia.nombre,
            })
            .select()
            .single();

        if (barberiaError) throw new Error(`Error creando barbería: ${barberiaError.message}`);
        const barberiaId = barberia.id;

        // ... (Rest of existing logic for Sucursal, Barbers, Services, etc.)
        */

        return { success: true, session };

    } catch (error: any) {
        console.error("Error en onboarding:", error);
        return { success: false, error: error.message };
    }
}
