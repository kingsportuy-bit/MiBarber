import { describe, it, expect } from 'vitest';

// Test para verificar que los imports de reexportación funcionan
import * as dateUtils from '@/utils/dateUtils';
import * as formatters from '@/utils/formatters';

describe('Reexport tests', () => {
  it('should export dateUtils functions', () => {
    expect(typeof dateUtils.getLocalDateString).toBe('function');
    expect(typeof dateUtils.getLocalDateTime).toBe('function');
  });

  it('should export formatters functions', () => {
    expect(typeof formatters.formatCurrency).toBe('function');
    expect(typeof formatters.formatWhatsAppTimestamp).toBe('function');
  });
});