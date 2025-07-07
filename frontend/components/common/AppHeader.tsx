import React from "react";
import { Sparkles, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  isDarkMode,
  onToggleDarkMode,
}) => {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 relative min-h-fit px-4 sm:px-0">
      {/* Dark Mode Toggle */}
      <Button
        onClick={onToggleDarkMode}
        variant="outline"
        size="sm"
        className="absolute left-0 top-1/2 -translate-y-1/2 h-9 w-9 sm:h-10 sm:w-auto sm:px-3"
      >
        {isDarkMode ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
        <span className="hidden sm:inline ml-2">
          {isDarkMode ? "Light" : "Dark"}
        </span>
      </Button>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
          <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
        </div>

        <h1
          className={`text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r ${
            isDarkMode
              ? "from-gray-100 to-gray-300"
              : "from-gray-900 to-gray-600"
          } bg-clip-text text-transparent z-10 text-center`}
        >
          VEXO Image Validation
        </h1>
      </div>
    </div>
  );
};
