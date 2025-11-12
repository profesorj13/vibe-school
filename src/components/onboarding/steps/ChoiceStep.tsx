import { cn } from "@/lib/utils";
import type { WizardOption } from "../wizardFlows";

interface ChoiceStepProps {
  options: WizardOption[];
  selectedValue?: string;
  onSelect: (value: string, label: string) => void;
}

export function ChoiceStep({
  options,
  selectedValue,
  onSelect,
}: ChoiceStepProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {options.map((option) => {
        const isSelected = selectedValue === option.id;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id, option.label)}
            className={cn(
              "relative px-6 py-5 rounded-xl border-2 text-left",
              "transition-all duration-200",
              "hover:scale-[1.02] active:scale-[0.98]",
              isSelected
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600",
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {option.icon && (
                  <span className="text-2xl">{option.icon}</span>
                )}
                <span
                  className={cn(
                    "text-lg font-medium",
                    isSelected
                      ? "text-blue-700 dark:text-blue-300"
                      : "text-gray-800 dark:text-gray-200",
                  )}
                >
                  {option.label}
                </span>
              </div>

              {/* Radio indicator */}
              <div
                className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                  "transition-all duration-200",
                  isSelected
                    ? "border-blue-500 bg-blue-500"
                    : "border-gray-300 dark:border-gray-600",
                )}
              >
                {isSelected && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

