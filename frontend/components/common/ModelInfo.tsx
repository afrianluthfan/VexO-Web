import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useModelInfo } from "@/lib/hooks/useModelInfo";
import { cn } from "@/lib/utils";

interface ModelInfoProps {
  isDarkMode?: boolean;
  className?: string;
}

export const ModelInfo: React.FC<ModelInfoProps> = ({
  isDarkMode = false,
  className = "",
}) => {
  const { modelInfo, loading, error } = useModelInfo();

  if (loading) {
    return (
      <Card
        className={cn(
          "transition-colors duration-200",
          isDarkMode
            ? "bg-gray-800/50 border-gray-700"
            : "bg-white/50 border-gray-200",
          className
        )}
      >
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span
              className={cn(
                "text-sm",
                isDarkMode ? "text-gray-300" : "text-gray-600"
              )}
            >
              Loading model information...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card
        className={cn(
          "transition-colors duration-200",
          isDarkMode
            ? "bg-gray-800/50 border-gray-700"
            : "bg-white/50 border-gray-200",
          className
        )}
      >
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-500">
            <XCircle className="h-4 w-4" />
            <span className="text-sm">Failed to load model info</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!modelInfo) {
    return null;
  }

  return (
    <Card
      className={cn(
        "transition-colors duration-200",
        isDarkMode
          ? "bg-gray-800/50 border-gray-700"
          : "bg-white/50 border-gray-200",
        className
      )}
    >
      <CardHeader className="pb-3">
        <CardTitle
          className={cn(
            "text-sm font-medium flex items-center gap-2",
            isDarkMode ? "text-gray-200" : "text-gray-700"
          )}
        >
          <Brain className="h-4 w-4" />
          AI Model Information
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "text-xs",
              isDarkMode ? "text-gray-400" : "text-gray-600"
            )}
          >
            Model:
          </span>
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-mono",
              isDarkMode
                ? "border-gray-600 text-gray-300"
                : "border-gray-300 text-gray-700"
            )}
          >
            {modelInfo.model_name}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span
            className={cn(
              "text-xs",
              isDarkMode ? "text-gray-400" : "text-gray-600"
            )}
          >
            Status:
          </span>
          <div className="flex items-center gap-1">
            {modelInfo.models_loaded ? (
              <CheckCircle className="h-3 w-3 text-green-500" />
            ) : (
              <XCircle className="h-3 w-3 text-red-500" />
            )}
            <span
              className={cn(
                "text-xs",
                modelInfo.models_loaded ? "text-green-500" : "text-red-500"
              )}
            >
              {modelInfo.models_loaded ? "Loaded" : "Not Loaded"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span
            className={cn(
              "text-xs",
              isDarkMode ? "text-gray-400" : "text-gray-600"
            )}
          >
            Type:
          </span>
          <span
            className={cn(
              "text-xs",
              isDarkMode ? "text-gray-300" : "text-gray-700"
            )}
          >
            {modelInfo.model_type}
          </span>
        </div>

        <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          <p
            className={cn(
              "text-xs",
              isDarkMode ? "text-gray-400" : "text-gray-600"
            )}
          >
            {modelInfo.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
