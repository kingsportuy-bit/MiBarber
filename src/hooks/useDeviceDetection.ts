"use client";

import { useState, useEffect } from "react";
import { 
  isMobile, 
  isTablet, 
  isDesktop, 
  getDeviceType,
  isTouchDevice,
  getScreenWidth,
  getScreenHeight,
  isIOS,
  isAndroid,
  isLandscape,
  isPortrait
} from "@/utils/deviceDetection";

export function useDeviceDetection() {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    deviceType: 'desktop' as 'mobile' | 'tablet' | 'desktop',
    isTouchDevice: false,
    isIOS: false,
    isAndroid: false,
    screenWidth: 0,
    screenHeight: 0,
    isLandscape: false,
    isPortrait: false
  });

  useEffect(() => {
    // Verificar si estamos en el cliente
    if (typeof window === 'undefined') return;

    const updateDeviceInfo = () => {
      setDeviceInfo({
        isMobile: isMobile(),
        isTablet: isTablet(),
        isDesktop: isDesktop(),
        deviceType: getDeviceType(),
        isTouchDevice: isTouchDevice(),
        isIOS: isIOS(),
        isAndroid: isAndroid(),
        screenWidth: getScreenWidth(),
        screenHeight: getScreenHeight(),
        isLandscape: isLandscape(),
        isPortrait: isPortrait()
      });
    };

    // Actualizar la información del dispositivo
    updateDeviceInfo();

    // Escuchar cambios en el tamaño de la ventana
    const handleResize = () => {
      updateDeviceInfo();
    };

    window.addEventListener('resize', handleResize);
    
    // Limpiar el event listener
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return deviceInfo;
}

// Hook específico para detectar si es móvil
export function useIsMobile() {
  const { isMobile } = useDeviceDetection();
  return isMobile;
}

// Hook específico para detectar si es tablet
export function useIsTablet() {
  const { isTablet } = useDeviceDetection();
  return isTablet;
}

// Hook específico para detectar si es desktop
export function useIsDesktop() {
  const { isDesktop } = useDeviceDetection();
  return isDesktop;
}

// Hook específico para detectar si es dispositivo táctil
export function useIsTouchDevice() {
  const { isTouchDevice } = useDeviceDetection();
  return isTouchDevice;
}