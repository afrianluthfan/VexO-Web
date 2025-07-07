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
    <div className="flex items-center justify-center gap-3 mb-4 relative min-h-fit">
      {/* Dark Mode Toggle */}
      <Button
        onClick={onToggleDarkMode}
        variant="outline"
        size="sm"
        className="absolute left-0 top-1/2 -translate-y-1/2"
      >
        {isDarkMode ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </Button>

      <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
        <Sparkles className="h-8 w-8 text-white" />
      </div>

      <h1
        className={`text-4xl font-bold bg-gradient-to-r ${
          isDarkMode ? "from-gray-100 to-gray-300" : "from-gray-900 to-gray-600"
        } bg-clip-text z-10`}
      >
        VEXO Image Validation
      </h1>
    </div>
  );
};
