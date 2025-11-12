import { cn } from "@/lib/utils";

interface WizardProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function WizardProgressBar({
  currentStep,
  totalSteps,
}: WizardProgressBarProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Paso {currentStep + 1} de {totalSteps}
        </span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full bg-gradient-to-r from-blue-500 to-purple-500",
            "transition-all duration-500 ease-out",
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

