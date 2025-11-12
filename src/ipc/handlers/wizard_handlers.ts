import { createLoggedHandler } from "./safe_handle";
import log from "electron-log";
import {
  validateWizardInput,
  type WizardValidationParams,
  type WizardValidationResult,
} from "../utils/wizard_validation_service";

const logger = log.scope("wizard-handlers");
const handle = createLoggedHandler(logger);

export function registerWizardHandlers() {
  handle(
    "wizard:validate",
    async (
      event,
      params: WizardValidationParams
    ): Promise<WizardValidationResult> => {
      return await validateWizardInput(params);
    }
  );
}

