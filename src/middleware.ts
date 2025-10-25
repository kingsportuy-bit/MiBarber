import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // BLOQUEAR RUTAS DE TESTING Y DEBUG EN PRODUCCIÓN
  const isProduction = process.env.NODE_ENV === "production";
  const isTestingRoute =
    pathname.startsWith("/test-") ||
    pathname.startsWith("/debug-") ||
    pathname.startsWith("/diagnostic");

  if (isProduction && isTestingRoute) {
    // En producción, redirigir rutas de testing a 404
    return NextResponse.redirect(new URL("/404", request.url));
  }

  // Rutas que siempre deben ser accesibles (públicas)
  const isPublicRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/admin") ||
    pathname === "/" ||
    pathname.includes(".") || // Archivos estáticos
    pathname.includes("_next") || // Recursos de Next.js
    pathname === "/favicon.ico" ||
    pathname === "/404";

  // Verificar si el usuario está autenticado usando cookies
  const authCookie = getCookie(request, "barber_auth_session");
  let isAuthenticated = false;

  if (authCookie) {
    try {
      const sessionData = JSON.parse(decodeURIComponent(authCookie));
      // Verificar si la sesión aún es válida
      if (sessionData.expiresAt && Date.now() < sessionData.expiresAt) {
        isAuthenticated = true;
      }
    } catch (error) {
      // Datos inválidos, cookie corrupta
      // No logueamos en producción para no llenar los logs
    }
  }

  // Si no está autenticado y no es una ruta pública, redirigir a login
  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Si está autenticado y trata de acceder al login, redirigir al dashboard
  if (isAuthenticated && pathname === "/login") {
    return NextResponse.redirect(new URL("/mibarber", request.url));
  }

  return NextResponse.next();
}

// Configurar qué rutas deben ser procesadas por el middleware
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
