import { createAzure } from "@ai-sdk/azure";
import { generateText } from "ai";
import { getEnvVar } from "./read_env";
import log from "electron-log";

const logger = log.scope("wizard-validation");

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

export async function validateWizardInput(
  params: WizardValidationParams
): Promise<WizardValidationResult> {
  const { flowId, stepId, inputText } = params;

  try {
    // Construir prompt de validación basado en el paso
    const validationPrompt = buildValidationPrompt(flowId, stepId, inputText);
    
    // Configurar provider con Azure
    const azureApiKey = getEnvVar("AZURE_API_KEY");
    const azureResourceName = getEnvVar("AZURE_RESOURCE_NAME");

    if (!azureApiKey || !azureResourceName) {
      throw new Error("Azure credentials not configured");
    }

    const provider = createAzure({
      resourceName: azureResourceName,
      apiKey: azureApiKey,
    });

    logger.info("Validating wizard input", { flowId, stepId, inputText });

    // Llamar a GPT-5-nano (sin temperature ni max_tokens según la documentación)
    const result = await generateText({
      model: provider("gpt-5-nano"),
      messages: [
        {
          role: "user",
          content: validationPrompt,
        },
      ],
      maxRetries: 2,
    });

    const response = result.text.trim().toLowerCase();
    logger.info("Validation response", { response });

    // Parsear respuesta
    return parseValidationResponse(response);
  } catch (error) {
    logger.error("Validation error", error);
    throw new Error(
      `Wizard validation failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

function buildValidationPrompt(
  flowId: string,
  stepId: string,
  inputText: string
): string {
  // Validación para paso de descripción de juego
  if (stepId === "juegos-descripcion") {
    return `Valida si la siguiente descripción de juego es clara y tiene sentido:
"${inputText}"

Responde ÚNICAMENTE con uno de estos formatos:
- Si es válida: "VALIDO"
- Si no es válida: "INVALIDO: [razón breve en español]"

Criterios:
- Debe tener al menos 10 caracteres, en caso de que falle dile "Expresate más sobre lo que quieres, así construimos algo mejor"
- Debe describir un concepto de juego coherente
- No debe contener lenguaje ofensivo, ni tocar temas sensibles para menores de 18 años o personas sensibles`;
  }

  // Validación para notas adicionales de juego (más permisiva)
  if (stepId === "juegos-notas") {
    return `Valida si las siguientes notas adicionales para un juego son apropiadas:
"${inputText}"

Responde ÚNICAMENTE con uno de estos formatos:
- Si es válida: "VALIDO"
- Si no es válida: "INVALIDO: [razón breve en español]"

Criterios:
- No debe contener lenguaje ofensivo, ni tocar temas sensibles para menores de 18 años o personas sensibles
- No debe incluir solicitudes inapropiadas
- Puede ser cualquier detalle o sugerencia relacionada con el juego`;
  }

  // Validación para paso de temas de aprendizaje
  if (stepId === "aprendizaje-temas") {
    return `Valida si el siguiente tema de aprendizaje es apropiado y claro:
"${inputText}"

Responde ÚNICAMENTE con uno de estos formatos:
- Si es válido: "VALIDO"
- Si no es válido: "INVALIDO: [razón breve en español]"

Criterios:
- Debe ser un tema educativo coherente
- No debe contener lenguaje ofensivo, ni tocar temas sensibles para menores de 18 años o personas sensibles`;
  }

  // Validación para notas adicionales de aprendizaje (más permisiva)
  if (stepId === "aprendizaje-notas") {
    return `Valida si las siguientes notas adicionales para una app de aprendizaje son apropiadas:
"${inputText}"

Responde ÚNICAMENTE con uno de estos formatos:
- Si es válida: "VALIDO"
- Si no es válida: "INVALIDO: [razón breve en español]"

Criterios:
- No debe contener lenguaje ofensivo, ni tocar temas sensibles para menores de 18 años o personas sensibles
- No debe incluir solicitudes inapropiadas
- Puede ser cualquier detalle o sugerencia relacionada con el aprendizaje`;
  }

  // Validación para paso de descripción de proyecto comunitario
  if (stepId === "comunidad-descripcion") {
    return `Valida si la siguiente descripción de proyecto comunitario es clara:
"${inputText}"

Responde ÚNICAMENTE con uno de estos formatos:
- Si es válida: "VALIDO"
- Si no es válida: "INVALIDO: [razón breve en español]"

Criterios:
- Debe tener al menos 10 caracteres
- Debe describir un problema comunitario real
- No debe contener lenguaje ofensivo`;
  }

  // Validación para notas adicionales de comunidad (más permisiva)
  if (stepId === "comunidad-notas") {
    return `Valida si las siguientes notas adicionales para un proyecto comunitario son apropiadas:
"${inputText}"

Responde ÚNICAMENTE con uno de estos formatos:
- Si es válida: "VALIDO"
- Si no es válida: "INVALIDO: [razón breve en español]"

Criterios:
- No debe contener lenguaje ofensivo
- No debe incluir solicitudes inapropiadas
- Puede ser cualquier detalle o sugerencia relacionada con el proyecto`;
  }

  // Validación genérica para cualquier otro paso
  return `Valida si el siguiente texto es apropiado:
"${inputText}"

Responde ÚNICAMENTE "VALIDO" o "INVALIDO: [razón]"`;
}

function parseValidationResponse(response: string): WizardValidationResult {
  if (response.includes("valido") && !response.includes("invalido")) {
    return {
      isValid: true,
    };
  }

  // Extraer razón si existe
  const match = response.match(/invalido:?\s*(.+)/i);
  const reason = match
    ? match[1].trim()
    : "La entrada no cumple con los criterios";

  return {
    isValid: false,
    reason,
  };
}

