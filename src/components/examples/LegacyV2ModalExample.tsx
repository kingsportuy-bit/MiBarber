import React, { useState } from 'react';
import { 
  LegacyV2Modal, 
  LegacyV2Form, 
  LegacyV2FormSection, 
  LegacyV2FormGroup, 
  LegacyV2Label, 
  LegacyV2Input, 
  LegacyV2Select, 
  LegacyV2Textarea, 
  LegacyV2Button,
  LegacyV2ModalFooter
} from '../LegacyV2Modal';

export function LegacyV2ModalExample() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form data:', formData);
    // Aquí iría la lógica para guardar los datos
    setIsModalOpen(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
      >
        Abrir Modal V2
      </button>

      <LegacyV2Modal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="Ejemplo de Formulario V2"
      >
        <LegacyV2Form onSubmit={handleSubmit}>
          <LegacyV2FormSection>
            <div className="v2-form-grid">
              <LegacyV2FormGroup>
                <LegacyV2Label htmlFor="name">Nombre Completo</LegacyV2Label>
                <LegacyV2Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Ingrese su nombre"
                  required
                />
              </LegacyV2FormGroup>

              <LegacyV2FormGroup>
                <LegacyV2Label htmlFor="email">Email</LegacyV2Label>
                <LegacyV2Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="Ingrese su email"
                  required
                />
              </LegacyV2FormGroup>

              <LegacyV2FormGroup className="full-width">
                <LegacyV2Label htmlFor="service">Servicio</LegacyV2Label>
                <LegacyV2Select
                  id="service"
                  value={formData.service}
                  onChange={(e) => handleChange('service', e.target.value)}
                  required
                >
                  <option value="">Seleccione un servicio</option>
                  <option value="corte">Corte de Cabello</option>
                  <option value="barba">Arreglo de Barba</option>
                  <option value="combo">Combo Corte + Barba</option>
                </LegacyV2Select>
              </LegacyV2FormGroup>

              <LegacyV2FormGroup className="full-width">
                <LegacyV2Label htmlFor="notes">Notas</LegacyV2Label>
                <LegacyV2Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Notas adicionales..."
                  rows={4}
                />
              </LegacyV2FormGroup>
            </div>
          </LegacyV2FormSection>

          <LegacyV2ModalFooter>
            <LegacyV2Button 
              type="button" 
              variant="secondary" 
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </LegacyV2Button>
            <LegacyV2Button type="submit" variant="primary">
              Guardar
            </LegacyV2Button>
          </LegacyV2ModalFooter>
        </LegacyV2Form>
      </LegacyV2Modal>
    </div>
  );
}