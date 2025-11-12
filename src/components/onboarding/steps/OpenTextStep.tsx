import { cn } from "@/lib/utils";

interface OpenTextStepProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isValidating?: boolean;
  validationError?: string;
}

export function OpenTextStep({
  value,
  onChange,
  placeholder,
  isValidating = false,
  validationError,
}: OpenTextStepProps) {
  const hasError = !!validationError;

  return (
    <div className="w-full">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={6}
          disabled={isValidating}
          className={cn(
            "w-full px-6 py-4 rounded-xl border-2",
            hasError
              ? "border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500/20"
              : "border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500/20",
            "bg-white dark:bg-gray-800",
            "text-gray-900 dark:text-gray-100",
            "placeholder-gray-400 dark:placeholder-gray-500",
            "focus:outline-none focus:ring-2",
            "transition-all duration-200",
            "resize-none",
            "text-lg",
            isValidating && "opacity-60 cursor-not-allowed",
          )}
        />
        {isValidating && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm">
            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm font-medium">Validando...</span>
            </div>
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex-1">
          {hasError && !isValidating && (
            <div className="flex items-start space-x-2 text-red-600 dark:text-red-400">
              <svg className="h-4 w-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">{validationError}</span>
            </div>
          )}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {value.length} caracteres
        </div>
      </div>
    </div>
  );
}

