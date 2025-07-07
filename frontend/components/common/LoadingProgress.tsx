import React from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LoadingProgressProps {
  message: string;
  description: string;
  progress?: number;
  variant?: "blue" | "green" | "purple";
  isDarkMode?: boolean;
}

export const LoadingProgress: React.FC<LoadingProgressProps> = ({
  message,
  description,
  progress = 50,
  variant = "blue",
  isDarkMode = false,
}) => {
  const variantClasses = {
    blue: {
      border: isDarkMode ? "border-blue-600/50" : "border-blue-200",
      bg: isDarkMode ? "bg-blue-950/30" : "bg-blue-50/80",
      text: isDarkMode ? "text-blue-100" : "text-blue-900",
      icon: isDarkMode ? "text-blue-400" : "text-blue-600",
      description: isDarkMode ? "text-blue-200" : "text-blue-700",
      progressBg: isDarkMode ? "bg-blue-950/50" : "bg-blue-100",
      progressIndicator: isDarkMode ? "bg-blue-400" : "bg-blue-600",
    },
    green: {
      border: isDarkMode ? "border-green-600/50" : "border-green-200",
      bg: isDarkMode ? "bg-green-950/30" : "bg-green-50/80",
      text: isDarkMode ? "text-green-100" : "text-green-900",
      icon: isDarkMode ? "text-green-400" : "text-green-600",
      description: isDarkMode ? "text-green-200" : "text-green-700",
      progressBg: isDarkMode ? "bg-green-950/50" : "bg-green-100",
      progressIndicator: isDarkMode ? "bg-green-400" : "bg-green-600",
    },
    purple: {
      border: isDarkMode ? "border-purple-600/50" : "border-purple-200",
      bg: isDarkMode ? "bg-purple-950/30" : "bg-purple-50/80",
      text: isDarkMode ? "text-purple-100" : "text-purple-900",
      icon: isDarkMode ? "text-purple-400" : "text-purple-600",
      description: isDarkMode ? "text-purple-200" : "text-purple-700",
      progressBg: isDarkMode ? "bg-purple-950/50" : "bg-purple-100",
      progressIndicator: isDarkMode ? "bg-purple-400" : "bg-purple-600",
    },
  };

  const classes = variantClasses[variant];

  return (
    <Card
      className={cn(
        "mb-6 sm:mb-8 transition-colors duration-200 mx-2 sm:mx-0",
        classes.border,
        classes.bg,
        isDarkMode ? "shadow-lg shadow-black/20" : "shadow-md"
      )}
    >
      <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <Loader2
            className={cn(
              "h-5 w-5 animate-spin transition-colors duration-200 flex-shrink-0",
              classes.icon
            )}
          />
          <span
            className={cn(
              "font-medium text-sm sm:text-base transition-colors duration-200",
              classes.text
            )}
          >
            {message}
          </span>
        </div>

        {/* Custom styled progress bar */}
        <div
          className={cn(
            "w-full h-2 rounded-full overflow-hidden mb-3 transition-colors duration-200",
            classes.progressBg
          )}
        >
          <div
            className={cn(
              "h-full transition-all duration-300 ease-out rounded-full",
              classes.progressIndicator
            )}
            style={{ width: `${progress}%` }}
          />
        </div>

        <p
          className={cn(
            "text-xs sm:text-sm transition-colors duration-200 leading-relaxed",
            classes.description
          )}
        >
          {description}
        </p>
      </CardContent>
    </Card>
  );
};
