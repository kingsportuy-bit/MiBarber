import { NextResponse } from 'next/server';
import { tempSignOut } from '@/lib/tempAuth';

export async function POST() {
  try {
    await tempSignOut();
    return NextResponse.json({ message: 'Sesión cerrada correctamente' });
  } catch (error) {
    console.error('Error en temp-logout:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}