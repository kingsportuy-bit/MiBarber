import { describe, it, expect } from 'vitest';
import { getLocalDateString } from '@/utils/dateUtils';
import { formatWhatsAppTimestamp, formatCurrency } from '@/utils/formatters';

describe('Utils tests', () => {
  it('should format currency correctly', () => {
    // Ajustar el test para aceptar el formato con espacio
    expect(formatCurrency(1000)).toMatch(/\$\s*1\.000,00/);
    expect(formatCurrency(null)).toBe('-');
    expect(formatCurrency(undefined)).toBe('-');
  });

  it('should get local date string', () => {
    // Crear una fecha específica para testing
    const testDate = new Date('2025-10-29T12:00:00Z');
    const result = getLocalDateString(testDate);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should format WhatsApp timestamp', () => {
    const now = new Date().toISOString();
    const result = formatWhatsAppTimestamp(now);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});