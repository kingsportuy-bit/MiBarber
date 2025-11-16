// Utilidades para detección de dispositivos móviles

export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

export function isTablet(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  return /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent);
}

export function isDesktop(): boolean {
  return !isMobile() && !isTablet();
}

export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (isMobile()) return 'mobile';
  if (isTablet()) return 'tablet';
  return 'desktop';
}

export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Obtener el ancho de la pantalla
export function getScreenWidth(): number {
  if (typeof window === 'undefined') return 0;
  return window.innerWidth;
}

// Obtener el alto de la pantalla
export function getScreenHeight(): number {
  if (typeof window === 'undefined') return 0;
  return window.innerHeight;
}

// Verificar si es un dispositivo iOS
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  return /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
}

// Verificar si es un dispositivo Android
export function isAndroid(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  return /Android/.test(userAgent);
}

// Verificar si el navegador soporta Service Workers (para PWA)
export function supportsServiceWorkers(): boolean {
  if (typeof window === 'undefined') return false;
  
  return 'serviceWorker' in navigator;
}

// Verificar si el dispositivo tiene conexión a internet
export function isOnline(): boolean {
  if (typeof window === 'undefined') return true;
  
  return navigator.onLine;
}

// Verificar si el dispositivo tiene orientación landscape
export function isLandscape(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.innerWidth > window.innerHeight;
}

// Verificar si el dispositivo tiene orientación portrait
export function isPortrait(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.innerHeight > window.innerWidth;
}