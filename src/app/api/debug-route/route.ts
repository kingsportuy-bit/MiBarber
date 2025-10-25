import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  console.log("=== DEBUG ROUTE: GET ===");
  console.log("URL:", request.url);
  console.log("Pathname:", url.pathname);
  
  return NextResponse.json({ 
    status: "ok", 
    method: "GET",
    url: request.url,
    pathname: url.pathname,
    message: "Debug route GET funcionando correctamente"
  });
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  console.log("=== DEBUG ROUTE: POST ===");
  console.log("URL:", request.url);
  console.log("Pathname:", url.pathname);
  
  try {
    const body = await request.json();
    console.log("Body recibido:", body);
    
    return NextResponse.json({ 
      status: "ok", 
      method: "POST",
      url: request.url,
      pathname: url.pathname,
      body: body,
      message: "Debug route POST funcionando correctamente"
    });
  } catch (error: any) {
    console.error("Error parseando body:", error);
    return NextResponse.json({ 
      status: "error", 
      method: "POST",
      url: request.url,
      pathname: url.pathname,
      error: error.message,
      message: "Error en debug route POST"
    }, { status: 400 });
  }
}