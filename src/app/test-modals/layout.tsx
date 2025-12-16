import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Prueba de Modales',
  description: 'Página de prueba para comparar modales viejos y nuevos',
};

export default function TestModalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}