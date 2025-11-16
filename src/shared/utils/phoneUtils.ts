// Función para normalizar números de teléfono
export const normalizePhoneNumber = (phone: string): string => {
  // Eliminar todos los caracteres que no sean dígitos
  const cleaned = phone.replace(/\D/g, '');
  
  console.log('=== DEBUG normalizePhoneNumber ===');
  console.log('Número ingresado:', phone);
  console.log('Número limpio:', cleaned);
  
  // Si el número comienza con 0 y tiene 9 dígitos (09xxxxxxx)
  if (cleaned.startsWith('0') && cleaned.length === 9) {
    const normalized = '+598' + cleaned.substring(1);
    console.log('Formato 09xxxxxxx -> normalizado a:', normalized);
    return normalized;
  }
  
  // Si comienza con 9 y tiene 8 dígitos (9xxxxxxx)
  if (cleaned.startsWith('9') && cleaned.length === 8) {
    const normalized = '+598' + cleaned;
    console.log('Formato 9xxxxxxx -> normalizado a:', normalized);
    return normalized;
  }
  
  // Si ya tiene el código de país 598 (11 dígitos total)
  if (cleaned.startsWith('598') && cleaned.length === 11) {
    const normalized = '+' + cleaned;
    console.log('Formato 5989xxxxxxx -> normalizado a:', normalized);
    return normalized;
  }
  
  // Si ya tiene + al inicio, devolverlo tal cual
  if (phone.startsWith('+598')) {
    console.log('Ya tiene formato +598');
    return phone;
  }
  
  console.log('Formato no reconocido, devolviendo limpio con +598');
  console.log('=== FIN DEBUG normalizePhoneNumber ===');
  
  // Por defecto, agregar código de país
  return '+598' + cleaned;
};


// Función para validar el formato del número de teléfono
export const isValidPhoneNumber = (phone: string): boolean => {
  // Eliminar espacios y caracteres especiales para la validación
  const cleaned = phone.replace(/\D/g, '');
  
  console.log('=== DEBUG isValidPhoneNumber ===');
  console.log('Número ingresado:', phone);
  console.log('Número limpio:', cleaned);
  console.log('Longitud:', cleaned.length);
  
  // Validar formatos uruguayos válidos:
  
  // 1. Formato: 09xxxxxxx (9 dígitos, comienza con 0)
  if (cleaned.startsWith('0') && cleaned.length === 9 && cleaned[1] === '9') {
    console.log('✓ Formato 09xxxxxxx válido');
    return true;
  }
  
  // 2. Formato: 9xxxxxxx (8 dígitos, comienza con 9)
  if (cleaned.startsWith('9') && cleaned.length === 8) {
    console.log('✓ Formato 9xxxxxxx válido');
    return true;
  }
  
  // 3. Formato: +5989xxxxxxx o 5989xxxxxxx (11 dígitos, comienza con 598)
  if (cleaned.startsWith('598') && cleaned.length === 11 && cleaned[3] === '9') {
    console.log('✓ Formato +5989xxxxxxx válido');
    return true;
  }
  
  console.log('✗ Formato NO válido');
  console.log('=== FIN DEBUG isValidPhoneNumber ===');
  
  return false;
};
