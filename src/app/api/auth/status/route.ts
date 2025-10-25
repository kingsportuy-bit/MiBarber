import { NextResponse } from 'next/server';
import { isTempAuthenticated, getTempUser } from '@/lib/tempAuth';

export async function GET() {
  try {
    const isAuthenticated = isTempAuthenticated();
    const user = getTempUser();
    
    return NextResponse.json({ 
      isAuthenticated,
      user
    });
  } catch (error) {
    console.error('Error en auth-status:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}