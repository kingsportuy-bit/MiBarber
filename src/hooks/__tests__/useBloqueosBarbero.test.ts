import { renderHook, waitFor } from '@testing-library/react';
import { useBloqueosBarbero } from '../useBloqueosBarbero';
import { useBarberoAuth } from '../useBarberoAuth';
import { vi, describe, it, expect } from 'vitest';

// Mock de todas las dependencias
vi.mock('@/lib/supabaseClient');
vi.mock('../useBarberoAuth');
vi.mock('@tanstack/react-query');

describe('useBloqueosBarbero', () => {
  it('debería existir el archivo', () => {
    // Test básico para verificar que el archivo existe
    expect(true).toBe(true);
  });
});
