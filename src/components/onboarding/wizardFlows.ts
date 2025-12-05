export interface WizardOption {
  id: string;
  label: string;
  icon?: string;
}

export interface WizardStep {
  id: string;
  type: "choice" | "multiple-choice" | "open-text";
  question: string;
  description?: string;
  options?: WizardOption[];
  placeholder?: string;
  validation?: (value: any) => boolean;
  errorMessage?: string;
}

export interface WizardFlow {
  id: string;
  name: string;
  steps: WizardStep[];
  // Función que determina el siguiente paso basado en las selecciones
  getNextStep: (
    currentStepIndex: number,
    selections: Record<string, any>,
  ) => number | null;
}

// ============= FLUJO: JUEGOS Y DESAFÍOS =============
const juegosFlow: WizardFlow = {
  id: "juegos-desafios",
  name: "Juegos y desafíos",
  steps: [
    {
      id: "juegos-quien-jugara",
      type: "choice",
      question: "¿Quién jugará este juego?",
      options: [
        { id: "solo-yo", label: "Solo yo" },
        { id: "amigos-familia", label: "Yo y mis amigos o familia" },
      ],
    },
    {
      id: "juegos-tipo-experiencia",
      type: "choice",
      question: "¿Qué tipo de experiencia buscas?",
      options: [
        { id: "desafiante", label: "Desafiante" },
        { id: "divertida", label: "Divertida" },
        { id: "inspiradora", label: "Inspiradora" },
      ],
    },
    {
      id: "juegos-estilo-visual",
      type: "choice",
      question: "¿Cómo quieres que vea?",
      options: [
        { id: "colorido-dinamico", label: "Colorido y dinámico" },
        { id: "minimalista-limpio", label: "Minimalista y limpio" },
        { id: "retropixel", label: "Retropixel" },
        { id: "futurista-tecnologico", label: "Futurista / tecnológico" },
      ],
    },
    {
      id: "juegos-descripcion",
      type: "open-text",
      question: "¿De qué quieres que trate?",
      placeholder: "Ej: Trivia de historia, juego de matemáticas, aventura espacial...",
      validation: (value: string) => value.trim().length > 5,
      errorMessage: "Por favor describe de qué quieres que trate tu juego",
    },
    {
      id: "juegos-notas",
      type: "open-text",
      question: "Abierta",
      description:
        "¿Hay algo más que quieras agregar sobre tu juego? (Opcional)",
      placeholder: "Cualquier detalle adicional que consideres importante...",
    },
  ],
  getNextStep: (currentStepIndex, selections) => {
    // Por defecto, avanza al siguiente paso
    if (currentStepIndex < juegosFlow.steps.length - 1) {
      return currentStepIndex + 1;
    }
    return null; // Fin del flujo
  },
};

// ============= FLUJO: APRENDIZAJE Y CONOCIMIENTO =============
const aprendizajeFlow: WizardFlow = {
  id: "aprendizaje-conocimiento",
  name: "Aprendizaje y conocimiento",
  steps: [
    {
      id: "aprendizaje-quien-usara",
      type: "choice",
      question: "¿Quién usará esta aplicación?",
      options: [
        { id: "solo-yo", label: "Solo yo" },
        { id: "amigos-familia", label: "Yo y mis amigos o familia" },
      ],
    },
    {
      id: "aprendizaje-tipo-experiencia",
      type: "choice",
      question: "¿Qué tipo de experiencia buscas crear?",
      options: [
        { id: "desafiante", label: "Desafiante" },
        { id: "divertida", label: "Divertida" },
        { id: "inspiradora", label: "Inspiradora" },
      ],
    },
    {
      id: "aprendizaje-temas",
      type: "open-text",
      question: "¿Qué temas te gustaría aprender?",
      placeholder:
        "Ej: Historia del arte, programación, idiomas, ciencias...",
      validation: (value: string) => value.trim().length > 5,
      errorMessage:
        "Por favor describe qué temas quieres incluir en tu aplicación",
    },
    {
      id: "aprendizaje-notas",
      type: "open-text",
      question: "Abierta",
      description:
        "¿Hay algo más que quieras agregar sobre tu aplicación? (Opcional)",
      placeholder: "Cualquier detalle adicional que consideres importante...",
    },
    {
      id: "aprendizaje-estilo-visual",
      type: "choice",
      question: "¿Cómo quieres que se vea?",
      options: [
        { id: "colorido-dinamico", label: "Colorido y dinámico" },
        { id: "minimalista-limpio", label: "Minimalista y limpio" },
        { id: "retropixel", label: "Retropixel" },
        { id: "futurista-tecnologico", label: "Futurista / tecnológico" },
      ],
    },
  ],
  getNextStep: (currentStepIndex, selections) => {
    // Por defecto, avanza al siguiente paso
    if (currentStepIndex < aprendizajeFlow.steps.length - 1) {
      return currentStepIndex + 1;
    }
    return null; // Fin del flujo
  },
};

// ============= FLUJO: AYUDAR EN MI COMUNIDAD =============
const comunidadFlow: WizardFlow = {
  id: "ayudar-comunidad",
  name: "Ayudar en mi comunidad",
  steps: [
    {
      id: "comunidad-quien-usara",
      type: "choice",
      question: "¿Quién usará esta aplicación?",
      options: [
        { id: "solo-yo", label: "Solo yo" },
        { id: "mi-comunidad", label: "Mi comunidad" },
        { id: "publico-general", label: "Público general" },
      ],
    },
    {
      id: "comunidad-descripcion",
      type: "open-text",
      question: "¿Qué problema quieres resolver en tu comunidad?",
      placeholder: "Ej: Organizar eventos, conectar vecinos, compartir recursos...",
      validation: (value: string) => value.trim().length > 5,
      errorMessage: "Por favor describe el problema que quieres resolver",
    },
    {
      id: "comunidad-notas",
      type: "open-text",
      question: "Abierta",
      description: "¿Hay algo más que quieras agregar? (Opcional)",
      placeholder: "Cualquier detalle adicional...",
    },
  ],
  getNextStep: (currentStepIndex, selections) => {
    if (currentStepIndex < comunidadFlow.steps.length - 1) {
      return currentStepIndex + 1;
    }
    return null;
  },
};

// ============= REGISTRO DE FLUJOS =============
export const WIZARD_FLOWS: Record<string, WizardFlow> = {
  "juegos-desafios": juegosFlow,
  "aprendizaje-conocimiento": aprendizajeFlow,
  "ayudar-comunidad": comunidadFlow,
};

// Helper para obtener flujo por ID
export const getFlowById = (flowId: string): WizardFlow | null => {
  return WIZARD_FLOWS[flowId] || null;
};

