# App Creation Wizard

Sistema de wizard multi-paso para guiar a los usuarios en la creación de aplicaciones.

## Estructura

```
onboarding/
├── AppCreationWizard.tsx      # Componente principal que orquesta el flujo
├── wizardFlows.ts             # Definición de flujos y pasos
├── WizardProgressBar.tsx      # Barra de progreso visual
├── WizardNavigation.tsx       # Botones de navegación
├── steps/
│   ├── StepContainer.tsx      # Wrapper para cada paso
│   ├── ChoiceStep.tsx         # Paso de selección única
│   └── OpenTextStep.tsx       # Paso de entrada de texto libre
```

## Flujos Implementados

### 1. Juegos y Desafíos
- Quién jugará
- Tipo de experiencia (Desafiante/Divertida/Inspiradora)
- Estilo visual
- Descripción del juego
- Notas adicionales

### 2. Aprendizaje y Conocimiento
- Quién usará la app
- Tipo de experiencia
- Temas de aprendizaje
- Notas adicionales

### 3. Ayudar en mi Comunidad
- TODO: Por implementar

## Uso

```tsx
import { AppCreationWizard } from "@/components/onboarding/AppCreationWizard";

<AppCreationWizard
  onComplete={(prompt) => {
    // El prompt generado está listo
    console.log(prompt);
  }}
  onCancel={() => {
    // Usuario canceló el wizard
  }}
/>
```

## Estado Global

El wizard usa Jotai para manejar su estado:

```typescript
const [wizardState, setWizardState] = useAtom(wizardStateAtom);

// Para activar el wizard
setWizardState(prev => ({ ...prev, isActive: true }));
```

## Agregar Nuevos Flujos

1. Define el flujo en `wizardFlows.ts`:

```typescript
const nuevoFlow: WizardFlow = {
  id: "mi-flujo",
  name: "Mi Flujo",
  steps: [
    {
      id: "paso-1",
      type: "choice",
      question: "¿Pregunta?",
      options: [
        { id: "opcion-1", label: "Opción 1" },
      ],
    },
  ],
  getNextStep: (currentStepIndex, selections) => {
    // Lógica para determinar siguiente paso
    return currentStepIndex + 1;
  },
};
```

2. Registra el flujo:

```typescript
export const WIZARD_FLOWS: Record<string, WizardFlow> = {
  // ...otros flujos
  "mi-flujo": nuevoFlow,
};
```

3. Actualiza la lógica de generación de prompt en `AppCreationWizard.tsx`.

## Tipos de Pasos

### Choice Step
Selección única entre opciones:
```typescript
{
  id: "mi-paso",
  type: "choice",
  question: "¿Qué prefieres?",
  options: [
    { id: "opcion-a", label: "Opción A" },
    { id: "opcion-b", label: "Opción B" },
  ],
}
```

### Open Text Step
Entrada de texto libre:
```typescript
{
  id: "descripcion",
  type: "open-text",
  question: "Describe tu app",
  placeholder: "Ej: Una app que...",
  validation: (value) => value.length > 10,
  errorMessage: "Escribe al menos 10 caracteres",
}
```

## Navegación Condicional

El método `getNextStep` permite lógica compleja:

```typescript
getNextStep: (currentStepIndex, selections) => {
  const currentStep = flow.steps[currentStepIndex];
  
  if (currentStep.id === "tipo") {
    const tipo = selections["tipo"];
    if (tipo === "simple") {
      return currentStepIndex + 1; // Paso normal
    } else {
      return currentStepIndex + 2; // Saltar un paso
    }
  }
  
  // null = fin del flujo
  return null;
}
```

## Telemetría

El wizard emite eventos PostHog:
- `home:wizard-started` - Usuario inicia el wizard
- `home:chat-submit` - Prompt generado y enviado

## Estilos

Todos los componentes usan Tailwind CSS con soporte para dark mode.

