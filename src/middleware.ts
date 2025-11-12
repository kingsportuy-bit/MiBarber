import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Función para obtener el valor de una cookie
function getCookie(request: NextRequest, name: string) {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return undefined;

  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
  for (const cookie of cookies) {
    if (cookie.startsWith(name + "=")) {
      return cookie.substring(name.length + 1);
    }
  }
  return undefined;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // NO procesar rutas de API
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // Actualizar la sesión de Supabase primero
  const supabaseResponse = await updateSession(request);
  
  // Verificar autenticación
  const isAuthenticated = await isAuthenticatedRequest(request);
  
  // Manejar la ruta raíz
  if (pathname === "/") {
    if (isAuthenticated) {
      const response = NextResponse.redirect(new URL("/inicio", request.url));
      return mergeResponses(supabaseResponse, response);
    } else {
      const response = NextResponse.redirect(new URL("/login", request.url));
      return mergeResponses(supabaseResponse, response);
    }
  }
  
  // Si no está autenticado y trata de acceder a una ruta protegida, redirigir al login
  if (!isAuthenticated && isProtectedRoute(pathname)) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    return mergeResponses(supabaseResponse, response);
  }

  // Si está autenticado y trata de acceder al login, redirigir al inicio
  if (isAuthenticated && pathname === "/login") {
    const response = NextResponse.redirect(new URL("/inicio", request.url));
    return mergeResponses(supabaseResponse, response);
  }

  return supabaseResponse;
}

// Configurar qué rutas deben ser procesadas por el middleware
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

// Rutas que requieren autenticación
function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = [
    "/inicio",
    "/agenda",
    "/clientes",
    "/whatsapp",
    "/mi-barberia",
    "/mis-datos",
    "/caja",
    "/bloqueos"
  ];
  
  return protectedRoutes.some(route => pathname.startsWith(route));
}

async function isAuthenticatedRequest(request: NextRequest) {
  const authCookie = getCookie(request, "barber_auth_session");
  if (!authCookie) return false;

  try {
    const sessionData = JSON.parse(decodeURIComponent(authCookie));
    // Verificar si la sesión aún es válida
    if (sessionData.expiresAt && Date.now() < sessionData.expiresAt) {
      return true;
    }
  } catch (error) {
    // Datos inválidos, cookie corrupta
  }

  return false;
}

// Función para combinar respuestas y mantener las cookies de ambas
function mergeResponses(supabaseResponse: NextResponse, appResponse: NextResponse) {
  const response = new NextResponse(appResponse.body, {
    status: appResponse.status,
    headers: appResponse.headers,
  });

  // Copiar las cookies de la respuesta de Supabase
  const supabaseCookies = supabaseResponse.cookies.getAll();
  for (const cookie of supabaseCookies) {
    response.cookies.set(cookie.name, cookie.value, cookie);
  }

  return response;
}