import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { useAuth } from '@/features/auth/hooks/useAuth';

// Mock de Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock de useAuth
vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('ProtectedRoute', () => {
  const mockPush = vi.fn();
  const mockUseAuth = useAuth as unknown as ReturnType<typeof vi.fn>;
  const mockUseRouter = useRouter as unknown as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: mockPush });
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isAdmin: false,
      loading: false,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('debe redirigir a login si no está autenticado', () => {
    render(
      <ProtectedRoute>
        <div>Contenido protegido</div>
      </ProtectedRoute>
    );

    expect(mockPush).toHaveBeenCalledWith('/login');
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
  });

  it('debe mostrar contenido si está autenticado', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isAdmin: false,
      loading: false,
    });

    render(
      <ProtectedRoute>
        <div>Contenido protegido</div>
      </ProtectedRoute>
    );

    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });

  it('debe redirigir a inicio si se requiere admin pero no lo es', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isAdmin: false,
      loading: false,
    });

    render(
      <ProtectedRoute requireAdmin={true}>
        <div>Contenido protegido</div>
      </ProtectedRoute>
    );

    expect(mockPush).toHaveBeenCalledWith('/inicio');
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
  });

  it('debe mostrar contenido si es admin y se requiere admin', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isAdmin: true,
      loading: false,
    });

    render(
      <ProtectedRoute requireAdmin={true}>
        <div>Contenido protegido</div>
      </ProtectedRoute>
    );

    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });
});