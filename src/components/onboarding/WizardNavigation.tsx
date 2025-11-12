import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface WizardNavigationProps {
  onBack?: () => void;
  onNext: () => void;
  onCancel: () => void;
  canGoBack: boolean;
  canGoNext: boolean;
  isLastStep: boolean;
  isLoading?: boolean;
}

export function WizardNavigation({
  onBack,
  onNext,
  onCancel,
  canGoBack,
  canGoNext,
  isLastStep,
  isLoading = false,
}: WizardNavigationProps) {
  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
      {/* Botón Cancelar */}
      <button
        type="button"
        onClick={onCancel}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg",
          "text-gray-600 dark:text-gray-400",
          "hover:bg-gray-100 dark:hover:bg-gray-800",
          "transition-all duration-200",
        )}
      >
        <X size={18} />
        <span>Cancelar</span>
      </button>

      <div className="flex items-center gap-3">
        {/* Botón Atrás */}
        {canGoBack && onBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={isLoading}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-lg",
              "border border-gray-300 dark:border-gray-600",
              "text-gray-700 dark:text-gray-300",
              "hover:bg-gray-50 dark:hover:bg-gray-800",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-all duration-200",
            )}
          >
            <ArrowLeft size={18} />
            <span>Atrás</span>
          </button>
        )}

        {/* Botón Siguiente/Crear */}
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext || isLoading}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-lg",
            "bg-gradient-to-r from-blue-500 to-purple-500",
            "text-white font-medium",
            "hover:shadow-lg hover:scale-[1.02]",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
            "transition-all duration-200",
          )}
        >
          <span>{isLastStep ? "Crear aplicación" : "Siguiente"}</span>
          {!isLastStep && <ArrowRight size={18} />}
        </button>
      </div>
    </div>
  );
}

