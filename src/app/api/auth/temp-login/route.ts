import { NextResponse } from 'next/server';
import { tempSignIn } from '@/lib/tempAuth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    const { user, error } = await tempSignIn(email, password);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error en temp-login:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}