import type { IPanelActionRepository, PanelActionPayload, BarberoxResponse } from "../contracts";

export class HttpPanelActionRepository implements IPanelActionRepository {
  async panelAction(payload: PanelActionPayload): Promise<BarberoxResponse> {
    if (payload.accion === 'reagendar') {
      throw new Error("Reagendar no está disponible temporalmente (Pendiente contrato de nuevo slot).");
    }

    const WEBHOOK_URL = "https://webhookn8ncodexa.codexa.uy/webhook/panel-accion";
    
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} al ejecutar acción en n8n`);
    }
    
    return await response.json();
  }
}
