import { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { wizardStateAtom, updateSelection } from "@/atoms/wizardAtoms";
import {
  getFlowById,
  type WizardFlow,
} from "./wizardFlows";
import { WizardProgressBar } from "./WizardProgressBar";
import { StepContainer } from "./steps/StepContainer";
import { ChoiceStep } from "./steps/ChoiceStep";
import { OpenTextStep } from "./steps/OpenTextStep";
import { WizardNavigation } from "./WizardNavigation";
import { cn } from "@/lib/utils";
import { useWizardValidation } from "@/hooks/useWizardValidation";

interface AppCreationWizardProps {
  onComplete: (generatedPrompt: string) => void;
  onCancel: () => void;
}

export function AppCreationWizard({
  onComplete,
  onCancel,
}: AppCreationWizardProps) {
  const [wizardState, setWizardState] = useAtom(wizardStateAtom);
  const [error, setError] = useState<string>("");
  const [tempValue, setTempValue] = useState<string>("");
  const [validationError, setValidationError] = useState<string>("");
  const { validate, isValidating, reset: resetValidation } = useWizardValidation();

  // Obtener el flujo actual desde el estado
  const currentFlow = getFlowById(wizardState.flowId);
  
  if (!currentFlow) {
    console.error("[WIZARD] Flow not found:", wizardState.flowId);
    return null;
  }

  const currentStep = currentFlow.steps[wizardState.currentStepIndex];
  const isLastStep = wizardState.currentStepIndex === currentFlow.steps.length - 1;

  // Cargar valor guardado cuando cambia el paso
  useEffect(() => {
    console.log("[WIZARD] Step changed to:", currentStep.id, "index:", wizardState.currentStepIndex);
    
    const savedSelection = wizardState.selections.find(
      (s) => s.stepId === currentStep.id,
    );
    if (savedSelection) {
      setTempValue(
        Array.isArray(savedSelection.value)
          ? savedSelection.value.join(", ")
          : savedSelection.value,
      );
    } else {
      setTempValue("");
    }
    setError("");
    setValidationError("");
    resetValidation();
  }, [currentStep.id, wizardState.currentStepIndex]);

  // Validar step open-text con IA
  const validateOpenTextStep = async (): Promise<boolean> => {
    if (currentStep.type !== "open-text") return true;
    
    // Si el campo está vacío y no es requerido, permitir continuar
    if (!tempValue.trim()) {
      // Campos opcionales (notas) pueden estar vacíos
      if (currentStep.id.includes("-notas")) {
        return true;
      }
      // Campos requeridos deben tener contenido
      setError("Por favor completa este campo");
      return false;
    }

    // Validación básica primero
    if (currentStep.validation && !currentStep.validation(tempValue)) {
      setError(
        currentStep.errorMessage || "Por favor completa este campo correctamente",
      );
      return false;
    }

    // Validación con IA para TODOS los pasos open-text que tengan contenido
    const needsAIValidation = [
      "juegos-descripcion",
      "juegos-notas",
      "aprendizaje-temas",
      "aprendizaje-notas",
      "comunidad-descripcion",
      "comunidad-notas",
    ].includes(currentStep.id);

    if (needsAIValidation && tempValue.trim()) {
      try {
        console.log("[WIZARD] Starting AI validation for", currentStep.id);
        const result = await validate({
          flowId: wizardState.flowId,
          stepId: currentStep.id,
          inputText: tempValue,
        });

        if (!result.isValid) {
          setValidationError(result.reason || "La validación falló");
          return false;
        }

        console.log("[WIZARD] AI validation passed");
        return true;
      } catch (error) {
        console.error("[WIZARD] AI validation error:", error);
        // Si falla la validación por error técnico, permitir continuar
        return true;
      }
    }

    return true;
  };

  // Función para validar el paso actual (choice steps)
  const validateCurrentStep = (): boolean => {
    setError("");

    // Validar que haya una selección para choice steps
    const hasSelection = wizardState.selections.some(
      (s) => s.stepId === currentStep.id,
    );

    if (!hasSelection && currentStep.type === "choice") {
      setError("Por favor selecciona una opción");
      return false;
    }

    return true;
  };

  // Manejar selección de opción
  const handleOptionSelect = (value: string, label: string) => {
    const newSelection = {
      stepId: currentStep.id,
      value,
      label,
    };

    setWizardState((prev) => ({
      ...prev,
      selections: updateSelection(prev.selections, newSelection),
    }));

    setTempValue(value);
    setError("");
  };

  // Manejar cambio en input de texto
  const handleTextChange = (value: string) => {
    setTempValue(value);
    setError("");
  };

  // Guardar el texto cuando se avanza
  const saveTextValue = () => {
    if (currentStep.type === "open-text") {
      const newSelection = {
        stepId: currentStep.id,
        value: tempValue,
      };

      setWizardState((prev) => ({
        ...prev,
        selections: updateSelection(prev.selections, newSelection),
      }));
    }
  };

  // Avanzar al siguiente paso
  const handleNext = async () => {
    console.log("[WIZARD] handleNext - currentStep:", currentStep.id);
    
    // Guardar valor de texto si es necesario
    saveTextValue();

    // Validar antes de avanzar (básico para choice, con IA para open-text)
    if (!validateCurrentStep()) {
      console.log("[WIZARD] Basic validation failed");
      return;
    }

    // Validación con IA para open-text
    const isValid = await validateOpenTextStep();
    if (!isValid) {
      console.log("[WIZARD] AI validation failed");
      return;
    }

    // Convertir selections array a objeto para getNextStep
    const selectionsObj = wizardState.selections.reduce(
      (acc, sel) => {
        acc[sel.stepId] = sel.value;
        return acc;
      },
      {} as Record<string, any>,
    );

    console.log("[WIZARD] Selections:", selectionsObj);

    const nextStepIndex = currentFlow.getNextStep(
      wizardState.currentStepIndex,
      selectionsObj,
    );

    console.log("[WIZARD] Next step index:", nextStepIndex);

    if (nextStepIndex === null) {
      // Fin del flujo - generar prompt y completar
      console.log("[WIZARD] Flow complete, generating prompt");
      handleComplete();
      return;
    }

    // Avanzar al siguiente paso
    setWizardState((prev) => ({
      ...prev,
      currentStepIndex: nextStepIndex,
      history: [...prev.history, prev.currentStepIndex],
    }));
  };

  // Retroceder al paso anterior
  const handleBack = () => {
    if (wizardState.history.length === 0) return;

    const previousStepIndex =
      wizardState.history[wizardState.history.length - 1];
    const newHistory = wizardState.history.slice(0, -1);

    setWizardState((prev) => ({
      ...prev,
      currentStepIndex: previousStepIndex,
      history: newHistory,
    }));
  };

  // Generar el prompt final
  const generatePrompt = (): string => {
    const selectionsMap = wizardState.selections.reduce(
      (acc, sel) => {
        acc[sel.stepId] = {
          value: sel.value,
          label: sel.label || (Array.isArray(sel.value) ? sel.value.join(", ") : sel.value),
        };
        return acc;
      },
      {} as Record<string, { value: string | string[]; label: string }>,
    );

    // Construir el prompt basado en el flujo actual
    let prompt = "";

    if (wizardState.flowId === "juegos-desafios") {
      prompt += "Crea un juego";
      
      const experiencia = selectionsMap["juegos-tipo-experiencia"];
      if (experiencia) {
        prompt += ` que sea ${experiencia.label.toLowerCase()}`;
      }

      const descripcion = selectionsMap["juegos-descripcion"];
      if (descripcion && typeof descripcion.value === "string") {
        prompt += `. ${descripcion.value}`;
      }

      const estilo = selectionsMap["juegos-estilo-visual"];
      if (estilo) {
        prompt += ` con un diseño ${estilo.label.toLowerCase()}`;
      }

      const quien = selectionsMap["juegos-quien-jugara"];
      if (quien) {
        if (quien.value === "solo-yo") {
          prompt += " para uso personal";
        } else {
          prompt += " para usar con amigos o familia";
        }
      }

      const notas = selectionsMap["juegos-notas"];
      if (notas && typeof notas.value === "string" && notas.value.trim()) {
        prompt += `. Detalles adicionales: ${notas.value}`;
      }
    } else if (wizardState.flowId === "aprendizaje-conocimiento") {
      prompt += "Crea una aplicación de aprendizaje";

      const experiencia = selectionsMap["aprendizaje-tipo-experiencia"];
      if (experiencia) {
        prompt += ` que sea ${experiencia.label.toLowerCase()}`;
      }

      const temas = selectionsMap["aprendizaje-temas"];
      if (temas && typeof temas.value === "string") {
        prompt += ` sobre ${temas.value}`;
      }

      const estilo = selectionsMap["aprendizaje-estilo-visual"];
      if (estilo) {
        prompt += ` con un diseño ${estilo.label.toLowerCase()}`;
      }

      const quien = selectionsMap["aprendizaje-quien-usara"];
      if (quien) {
        if (quien.value === "solo-yo") {
          prompt += " para uso personal";
        } else {
          prompt += " para usar con amigos o familia";
        }
      }

      const notas = selectionsMap["aprendizaje-notas"];
      if (notas && typeof notas.value === "string" && notas.value.trim()) {
        prompt += `. Detalles adicionales: ${notas.value}`;
      }
    } else if (wizardState.flowId === "ayudar-comunidad") {
      prompt += "Crea una aplicación para ayudar en la comunidad";

      const descripcion = selectionsMap["comunidad-descripcion"];
      if (descripcion && typeof descripcion.value === "string") {
        prompt += `. ${descripcion.value}`;
      }

      const quien = selectionsMap["comunidad-quien-usara"];
      if (quien) {
        prompt += ` para ${quien.label.toLowerCase()}`;
      }

      const notas = selectionsMap["comunidad-notas"];
      if (notas && typeof notas.value === "string" && notas.value.trim()) {
        prompt += `. Detalles adicionales: ${notas.value}`;
      }
    }

    console.log("[WIZARD] Generated prompt:", prompt);
    return prompt;
  };

  // Completar el wizard
  const handleComplete = () => {
    const prompt = generatePrompt();
    onComplete(prompt);
  };

  // Obtener el valor seleccionado actual
  const getCurrentValue = (): string | undefined => {
    const selection = wizardState.selections.find(
      (s) => s.stepId === currentStep.id,
    );
    return selection
      ? Array.isArray(selection.value)
        ? selection.value[0]
        : selection.value
      : undefined;
  };

  // Verificar si se puede avanzar
  const canGoNext = () => {
    if (currentStep.type === "open-text") {
      // Los pasos opcionales (notas) pueden estar vacíos
      if (currentStep.id.includes("-notas")) {
        return true;
      }
      return tempValue.trim().length > 0;
    }
    return wizardState.selections.some((s) => s.stepId === currentStep.id);
  };

  return (
    <div
      className={cn(
        "w-full max-w-4xl mx-auto p-8",
        "animate-in fade-in duration-500",
      )}
    >
      <WizardProgressBar
        currentStep={wizardState.currentStepIndex}
        totalSteps={currentFlow.steps.length}
      />

      <StepContainer
        question={currentStep.question}
        description={currentStep.description}
        error={error}
      >
        {currentStep.type === "choice" && currentStep.options && (
          <ChoiceStep
            options={currentStep.options}
            selectedValue={getCurrentValue()}
            onSelect={handleOptionSelect}
          />
        )}

        {currentStep.type === "open-text" && (
          <OpenTextStep
            value={tempValue}
            onChange={handleTextChange}
            placeholder={currentStep.placeholder}
            isValidating={isValidating}
            validationError={validationError}
          />
        )}
      </StepContainer>

      <WizardNavigation
        onBack={handleBack}
        onNext={handleNext}
        onCancel={onCancel}
        canGoBack={wizardState.history.length > 0}
        canGoNext={canGoNext() && !isValidating}
        isLastStep={isLastStep}
      />
    </div>
  );
}

