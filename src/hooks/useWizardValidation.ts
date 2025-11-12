import { useMutation } from "@tanstack/react-query";
import { IpcClient } from "@/ipc/ipc_client";

export interface WizardValidationParams {
  flowId: string;
  stepId: string;
  inputText: string;
}

export interface WizardValidationResult {
  isValid: boolean;
  reason?: string;
  suggestedFix?: string;
}

export function useWizardValidation() {
  const mutation = useMutation<
    WizardValidationResult,
    Error,
    WizardValidationParams
  >({
    mutationFn: async (params) => {
      const ipcClient = IpcClient.getInstance();
      return await ipcClient.validateWizardInput(params);
    },
    // No mostrar error automático, lo manejamos en el componente
    onError: () => {
      // Silencioso - el componente decide cómo mostrar el error
    },
  });

  return {
    validate: mutation.mutateAsync,
    isValidating: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}

