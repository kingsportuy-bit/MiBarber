import { supabase } from "./supabaseClient";
import { tempSignIn, tempSignOut, getTempUser } from "./tempAuth";

// Configuración híbrida: auth temporal + base de datos real
// Debido a limitaciones del email provider en Supabase autohospedado
const USE_TEMP_AUTH = true; // Auth temporal, pero BD real para datos

console.log("✅ Usando configuración temporal de Supabase");

export async function signInWithPassword(email: string, password: string) {
  if (USE_TEMP_AUTH) {
    const { user, error } = await tempSignIn(email, password);
    if (error) {
      throw new Error(error.message);
    }
    return { user };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function signOut() {
  if (USE_TEMP_AUTH) {
    await tempSignOut();
    return;
  }

  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw new Error(error.message);
  }
}

export async function getCurrentUser() {
  if (USE_TEMP_AUTH) {
    return getTempUser();
  }

  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    throw new Error(error.message);
  }
  
  return user;
}