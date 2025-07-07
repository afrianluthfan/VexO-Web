import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ValidationResult } from "@/types/validation";
import { cn } from "@/lib/utils";

interface ValidationResultsProps {
  results: ValidationResult[];
  title: string;
  description: string;
  icon: React.ReactNode;
  variant?: "default" | "excel" | "google-drive";
  isDarkMode?: boolean;
}

export const ValidationResults: React.FC<ValidationResultsProps> = ({
  results,
  title,
  description,
  icon,
  variant = "default",
  isDarkMode = false,
}) => {
  if (results.length === 0) return null;

  return (
    <Card
      className={cn(
        "shadow-lg border-0 backdrop-blur-sm transition-colors duration-200",
        isDarkMode
          ? "bg-gray-800/90 border-gray-700/50"
          : "bg-white/90 border-gray-200/50"
      )}
    >
      <CardHeader>
        <CardTitle
          className={cn(
            "flex items-center gap-2 transition-colors duration-200",
            isDarkMode ? "text-gray-100" : "text-gray-900"
          )}
        >
          {icon}
          {title}
        </CardTitle>
        <CardDescription
          className={cn(
            "transition-colors duration-200",
            isDarkMode ? "text-gray-300" : "text-gray-600"
          )}
        >
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={index}>
              <Card
                className={cn(
                  "transition-all duration-300 hover:shadow-md",
                  result.is_valid
                    ? isDarkMode
                      ? "border-green-600/50 bg-green-950/30 hover:bg-green-950/40"
                      : "border-green-200 bg-green-50/70 hover:bg-green-50/90"
                    : isDarkMode
                    ? "border-red-600/50 bg-red-950/30 hover:bg-red-950/40"
                    : "border-red-200 bg-red-50/70 hover:bg-red-50/90"
                )}
              >
                <CardContent className="pt-4 sm:pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      {result.is_valid ? (
                        <CheckCircle2
                          className={cn(
                            "h-5 w-5 sm:h-6 sm:w-6 transition-colors duration-200 flex-shrink-0",
                            isDarkMode ? "text-green-400" : "text-green-600"
                          )}
                        />
                      ) : (
                        <XCircle
                          className={cn(
                            "h-5 w-5 sm:h-6 sm:w-6 transition-colors duration-200 flex-shrink-0",
                            isDarkMode ? "text-red-400" : "text-red-600"
                          )}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3
                          className={cn(
                            "font-semibold text-base sm:text-lg transition-colors duration-200 truncate",
                            isDarkMode ? "text-gray-100" : "text-gray-900"
                          )}
                        >
                          {variant === "excel" ? `Row ${index + 1}: ` : ""}
                          {result.filename}
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <Badge
                            variant={
                              result.is_valid ? "default" : "destructive"
                            }
                            className="transition-colors duration-200 text-xs"
                          >
                            {result.is_valid ? "VALID" : "INVALID"}
                          </Badge>
                          {variant === "excel" && (
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs transition-colors duration-200",
                                isDarkMode
                                  ? "border-gray-600 text-gray-300"
                                  : "border-gray-300 text-gray-700"
                              )}
                            >
                              Excel + Google Drive
                            </Badge>
                          )}
                          {variant === "google-drive" && (
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs transition-colors duration-200",
                                isDarkMode
                                  ? "border-gray-600 text-gray-300"
                                  : "border-gray-300 text-gray-700"
                              )}
                            >
                              Google Drive
                            </Badge>
                          )}
                        </div>
                        {result.drive_url && (
                          <a
                            href={result.drive_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              "text-xs underline mt-1 block transition-colors duration-200 truncate",
                              isDarkMode
                                ? "text-blue-400 hover:text-blue-300"
                                : "text-blue-600 hover:text-blue-800"
                            )}
                          >
                            View in Google Drive
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="text-center sm:text-right flex-shrink-0">
                      <div
                        className={cn(
                          "text-xl sm:text-2xl font-bold transition-colors duration-200",
                          isDarkMode ? "text-gray-100" : "text-gray-900"
                        )}
                      >
                        {result.percentage.toFixed(1)}%
                      </div>
                      <div
                        className={cn(
                          "text-xs sm:text-sm transition-colors duration-200",
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        )}
                      >
                        Score: {result.validity_score.toFixed(4)}
                      </div>
                      {result.file_id && (
                        <div
                          className={cn(
                            "text-xs mt-1 transition-colors duration-200",
                            isDarkMode ? "text-gray-500" : "text-gray-500"
                          )}
                        >
                          ID: {result.file_id.substring(0, 8)}...
                        </div>
                      )}
                    </div>
                  </div>

                  <Progress value={result.percentage} className="mb-3" />

                  <p
                    className={cn(
                      "text-sm p-3 rounded-md transition-colors duration-200",
                      isDarkMode
                        ? "text-gray-300 bg-gray-900/40 border border-gray-700/50"
                        : "text-gray-700 bg-gray-50 border border-gray-200/50"
                    )}
                  >
                    {result.message}
                  </p>
                </CardContent>
              </Card>
              {index < results.length - 1 && (
                <Separator
                  className={cn(
                    "my-4 transition-colors duration-200",
                    isDarkMode ? "border-gray-700" : "border-gray-200"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
