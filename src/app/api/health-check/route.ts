import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    status: "ok", 
    message: "API funcionando correctamente",
    timestamp: new Date().toISOString()
  });
}

export async function POST() {
  return NextResponse.json({ 
    status: "ok", 
    message: "API POST funcionando correctamente",
    timestamp: new Date().toISOString()
  });
}