import { atom } from "jotai";

export interface WizardSelection {
  stepId: string;
  value: string | string[];
  label?: string;
}

export interface WizardState {
  isActive: boolean;
  currentStepIndex: number;
  flowId: string; // ID del flujo actual (ej: "juegos-desafios")
  selections: WizardSelection[];
  history: number[]; // Para poder navegar hacia atrás
}

export const wizardStateAtom = atom<WizardState>({
  isActive: false,
  currentStepIndex: 0,
  flowId: "juegos-desafios", // Default, pero se sobrescribirá al iniciar
  selections: [],
  history: [],
});

// Helper para obtener selección por stepId
export const getSelectionByStepId = (
  selections: WizardSelection[],
  stepId: string,
): WizardSelection | undefined => {
  return selections.find((s) => s.stepId === stepId);
};

// Helper para actualizar o agregar selección
export const updateSelection = (
  selections: WizardSelection[],
  newSelection: WizardSelection,
): WizardSelection[] => {
  const existingIndex = selections.findIndex(
    (s) => s.stepId === newSelection.stepId,
  );

  if (existingIndex >= 0) {
    const updated = [...selections];
    updated[existingIndex] = newSelection;
    return updated;
  }

  return [...selections, newSelection];
};

