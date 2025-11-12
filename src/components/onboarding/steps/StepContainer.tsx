import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StepContainerProps {
  question: string;
  description?: string;
  children: ReactNode;
  error?: string;
}

export function StepContainer({
  question,
  description,
  children,
  error,
}: StepContainerProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {question}
        </h2>
        {description && (
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {description}
          </p>
        )}
      </div>

      <div className="mb-6">{children}</div>

      {error && (
        <div
          className={cn(
            "mt-4 p-4 rounded-lg",
            "bg-red-50 dark:bg-red-900/20",
            "border border-red-200 dark:border-red-800",
            "text-red-700 dark:text-red-400",
            "text-sm font-medium",
          )}
        >
          {error}
        </div>
      )}
    </div>
  );
}

