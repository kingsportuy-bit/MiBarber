import type { IPanelActionRepository, PanelActionPayload, BarberoxResponse } from "../contracts";

export class HttpPanelActionRepository implements IPanelActionRepository {
  async panelAction(payload: PanelActionPayload): Promise<BarberoxResponse> {
    // Por ahora lanzamos error según lo solicitado por Codex
    throw new Error("Esperando webhook panel_barbero de Codex — ver communication.md");
    
    /* 
    Implementación futura cuando el webhook esté listo:
    const response = await fetch("POST_WEBHOOK_URL", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    return await response.json();
    */
  }
}
