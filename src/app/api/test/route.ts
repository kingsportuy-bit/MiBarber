import { NextResponse } from 'next/server';

export async function GET() {
  console.log('🔵 GET /api/test - Endpoint de prueba funcionando');
  return NextResponse.json({ status: 'ok', message: 'API de prueba funciona' });
}

export async function POST() {
  console.log('🔵 POST /api/test - Endpoint de prueba funcionando');
  return NextResponse.json({ status: 'ok', message: 'API de prueba funciona' });
}