// Sistema de autenticación temporal para desarrollo
// Este archivo permite probar la aplicación sin depender de Supabase

interface TempUser {
  id: string;
  email: string;
  name?: string;
}

// Usuario temporal para desarrollo
const TEMP_USER: TempUser = {
  id: 'temp-user-123',
  email: 'admin@mibarber.com',
  name: 'Administrador'
};

// Simular autenticación temporal
export async function tempSignIn(email: string, password: string) {
  console.log('🔐 Intentando login temporal con:', email);
  
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Verificar credenciales (solo para desarrollo)
  const isValidCredentials = 
    (email === 'admin@mibarber.com' && password === '123456');
  
  if (isValidCredentials) {
    console.log('✅ Credenciales correctas');
    // Guardar en localStorage para simular sesión persistente
    const sessionData = {
      user: TEMP_USER,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // Expira en 24 horas
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('temp_auth_session', JSON.stringify(sessionData));
    }
    console.log('💾 Sesión temporal guardada');
    
    // Disparar evento personalizado para notificar el cambio
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tempAuthChange', { 
        detail: { user: TEMP_USER, action: 'login' 
      } }));
    }
    
    return { user: TEMP_USER, error: null };
  }
  
  console.log('❌ Credenciales incorrectas');
  return { user: null, error: { message: 'Credenciales incorrectas' } };
}

export async function tempSignOut() {
  console.log('🚪 Cerrando sesión temporal');
  if (typeof window !== 'undefined') {
    localStorage.removeItem('temp_auth_session');
  }
  
  // Disparar evento personalizado para notificar el cambio
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tempAuthChange', { 
      detail: { user: null, action: 'logout' 
    } }));
  }
  
  return { error: null };
}

export function getTempUser(): TempUser | null {
  if (typeof window === 'undefined') {
    console.log('🌐 getTempUser: window no disponible (SSR)');
    return null;
  }
  
  if (typeof localStorage === 'undefined') {
    console.log('🌐 getTempUser: localStorage no disponible');
    return null;
  }
  
  const sessionStr = localStorage.getItem('temp_auth_session');
  if (!sessionStr) {
    console.log('🔍 getTempUser: No hay sesión guardada');
    return null;
  }
  
  try {
    const sessionData = JSON.parse(sessionStr);
    console.log('📄 getTempUser: Datos de sesión encontrados', sessionData);
    // Verificar si la sesión aún es válida
    if (sessionData.expiresAt && Date.now() < sessionData.expiresAt) {
      console.log('✅ getTempUser: Sesión válida');
      return sessionData.user;
    } else {
      // Sesión expirada, limpiar
      console.log('⏰ getTempUser: Sesión expirada, limpiando');
      localStorage.removeItem('temp_auth_session');
      return null;
    }
  } catch (error) {
    // Datos inválidos, limpiar
    console.log('❌ getTempUser: Datos inválidos, limpiando', error);
    localStorage.removeItem('temp_auth_session');
    return null;
  }
}

export function isTempAuthenticated(): boolean {
  const user = getTempUser();
  const isAuthenticated = user !== null;
  console.log('🔑 isTempAuthenticated:', isAuthenticated, user);
  return isAuthenticated;
}