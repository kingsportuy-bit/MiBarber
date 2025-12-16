# Componentes V2 para Páginas Antiguas

Este directorio contiene componentes que replican el estilo V2 pero que pueden usarse en páginas antiguas sin necesidad de estar dentro del layout V2.

## Componentes Disponibles

### 1. LegacyV2Modal
Componente base de modal que replica visualmente los estilos V2.

```tsx
import { LegacyV2Modal } from '@/components/LegacyV2Modal';

<LegacyV2Modal
  open={true}
  onOpenChange={setIsOpen}
  title="Título del Modal"
>
  <div>Contenido del modal</div>
</LegacyV2Modal>
```

### 2. LegacyV2Form
Formulario que replica los estilos V2.

```tsx
import { LegacyV2Form } from '@/components/LegacyV2Modal';

<LegacyV2Form onSubmit={handleSubmit}>
  <div>Campos del formulario</div>
</LegacyV2Form>
```

### 3. Componentes de Formulario
- `LegacyV2FormSection` - Sección de formulario
- `LegacyV2FormGroup` - Grupo de campos
- `LegacyV2Label` - Etiqueta
- `LegacyV2Input` - Campo de entrada
- `LegacyV2Select` - Selector
- `LegacyV2Textarea` - Área de texto
- `LegacyV2Button` - Botón
- `LegacyV2ModalFooter` - Pie de modal

### 4. LegacyAppointmentModal
Modal específico para citas que utiliza los estilos V2.

```tsx
import { LegacyAppointmentModal } from '@/components/LegacyAppointmentModal';

<LegacyAppointmentModal
  open={true}
  onOpenChange={setIsOpen}
  initial={initialData}
  onSave={handleSave}
/>
```

### 5. LegacyPagesAppointmentModal
Modal completo para páginas antiguas con lógica de guardado incorporada.

```tsx
import { LegacyPagesAppointmentModal } from '@/components/pages/LegacyPagesAppointmentModal';

<LegacyPagesAppointmentModal
  open={true}
  onOpenChange={setIsOpen}
  initial={initialData}
/>
```

## Uso en Páginas Antiguas

Para usar estos componentes en páginas antiguas:

1. Importa el componente necesario
2. Usa los componentes como se muestra en los ejemplos
3. Los estilos se aplican automáticamente gracias al archivo CSS

## Ventajas

- Visualmente idénticos a los componentes V2
- Funcionan independientemente del layout V2
- No requieren cambios en el layout de las páginas antiguas
- Mantienen la consistencia del diseño

## Archivos Relacionados

- `V2Form.css` - Estilos CSS para los componentes
- `LegacyV2Modal.tsx` - Componentes base
- `SimpleAppointmentModal.tsx` - Modal de citas simplificado
- `LegacyAppointmentModal.tsx` - Wrapper del modal de citas
- `LegacyPagesAppointmentModal.tsx` - Modal completo con lógica