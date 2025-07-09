import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  Eye,
  ArrowUpDown,
  ChevronDown,
  Check,
} from "lucide-react";
import { createPortal } from "react-dom";
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
import { Button } from "@/components/ui/button";
import { ValidationResult } from "@/types/validation";
import { cn } from "@/lib/utils";

interface ImageListPopupProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  title: string;
  type: "valid" | "invalid";
  isDarkMode: boolean;
}

const ImageListPopup: React.FC<ImageListPopupProps> = ({
  isOpen,
  onClose,
  images,
  title,
  type,
  isDarkMode,
}) => {
  if (!isOpen) return null;

  const popupContent = (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <Card
        className={`w-full max-w-md max-h-[80vh] overflow-hidden ${
          isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white"
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle
              className={`text-lg flex items-center gap-2 ${
                isDarkMode ? "text-gray-100" : "text-gray-900"
              }`}
            >
              {type === "valid" ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              {title}
            </CardTitle>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className={isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {images.length === 0 ? (
              <p
                className={`text-sm italic ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                No {type} images found.
              </p>
            ) : (
              images.map((filename, index) => (
                <div
                  key={index}
                  className={`p-2 rounded text-sm border ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-gray-200"
                      : "bg-gray-50 border-gray-200 text-gray-800"
                  }`}
                >
                  {filename}
                </div>
              ))
            )}
          </div>
          <div className="mt-4 text-right">
            <Button
              onClick={onClose}
              size="sm"
              className={
                isDarkMode
                  ? "bg-gray-600 hover:bg-gray-700 text-white"
                  : "bg-gray-600 hover:bg-gray-700 text-white"
              }
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Use portal to render at document root level
  return typeof document !== "undefined"
    ? createPortal(popupContent, document.body)
    : null;
};

interface ValidationResultsProps {
  results: ValidationResult[];
  title: string;
  description: string;
  icon: React.ReactNode;
  variant?: "default" | "excel" | "google-drive";
  isDarkMode?: boolean;
}

type SortOption =
  | "default"
  | "valid-first"
  | "invalid-first"
  | "alphabetical"
  | "score-high"
  | "score-low";

const sortOptions = [
  { value: "default", label: "Default Order" },
  { value: "valid-first", label: "Valid First" },
  { value: "invalid-first", label: "Invalid First" },
  { value: "alphabetical", label: "Alphabetical" },
  { value: "score-high", label: "Highest Score" },
  { value: "score-low", label: "Lowest Score" },
] as const;

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  isDarkMode: boolean;
}

const SortDropdown: React.FC<SortDropdownProps> = ({
  value,
  onChange,
  isDarkMode,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentOption = sortOptions.find((option) => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 ${
          isDarkMode
            ? "border-gray-600 text-gray-300 hover:bg-gray-700"
            : "border-gray-300 text-gray-700 hover:bg-gray-50"
        }`}
      >
        <ArrowUpDown className="h-4 w-4" />
        {currentOption?.label}
        <ChevronDown className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div
          className={`absolute right-0 top-full mt-1 z-50 min-w-[180px] rounded-md border shadow-lg ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-md last:rounded-b-md ${
                value === option.value
                  ? isDarkMode
                    ? "bg-gray-700 text-gray-100"
                    : "bg-gray-100 text-gray-900"
                  : isDarkMode
                  ? "text-gray-300"
                  : "text-gray-700"
              }`}
            >
              {option.label}
              {value === option.value && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const ValidationResults: React.FC<ValidationResultsProps> = ({
  results,
  title,
  description,
  icon,
  variant = "default",
  isDarkMode = false,
}) => {
  const [validPopupOpen, setValidPopupOpen] = useState(false);
  const [invalidPopupOpen, setInvalidPopupOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("default");

  // Sorting function
  const sortedResults = useMemo(() => {
    const resultsCopy = [...results];

    switch (sortBy) {
      case "valid-first":
        return resultsCopy.sort(
          (a, b) => (b.is_valid ? 1 : 0) - (a.is_valid ? 1 : 0)
        );
      case "invalid-first":
        return resultsCopy.sort(
          (a, b) => (a.is_valid ? 1 : 0) - (b.is_valid ? 1 : 0)
        );
      case "alphabetical":
        return resultsCopy.sort((a, b) => a.filename.localeCompare(b.filename));
      case "score-high":
        return resultsCopy.sort((a, b) => b.validity_score - a.validity_score);
      case "score-low":
        return resultsCopy.sort((a, b) => a.validity_score - b.validity_score);
      default:
        return resultsCopy;
    }
  }, [results, sortBy]);

  if (results.length === 0) return null;

  // Calculate valid and invalid counts
  const validImages = results.filter((result) => result.is_valid);
  const invalidImages = results.filter((result) => !result.is_valid);

  const validCount = validImages.length;
  const invalidCount = invalidImages.length;

  // Get filenames for popups
  const validFilenames = validImages.map((result) => result.filename);
  const invalidFilenames = invalidImages.map((result) => result.filename);

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
            "flex items-start justify-between gap-4 transition-colors duration-200",
            isDarkMode ? "text-gray-100" : "text-gray-900"
          )}
        >
          <div className="flex flex-col items-start gap-3">
            <div className="flex items-center gap-2">
              {icon}
              {title}
            </div>
            <div className="text-sm font-normal">
              <CardDescription
                className={cn(
                  "transition-colors duration-200",
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                )}
              >
                {description}
              </CardDescription>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-3">
              {/* Valid Images Button */}
              <Button
                onClick={() => setValidPopupOpen(true)}
                variant="outline"
                size="sm"
                className={`flex items-center gap-2 ${
                  isDarkMode
                    ? "border-green-600/50 text-green-400 hover:bg-green-950/30"
                    : "border-green-300 text-green-700 hover:bg-green-50"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                <Badge
                  variant="secondary"
                  className={
                    isDarkMode
                      ? "bg-green-950/50 text-green-400 border-green-600/50"
                      : "bg-green-100 text-green-800 border-green-300"
                  }
                >
                  {validCount}
                </Badge>
                Valid
                <Eye className="h-3 w-3 ml-1" />
              </Button>

              {/* Invalid Images Button */}
              <Button
                onClick={() => setInvalidPopupOpen(true)}
                variant="outline"
                size="sm"
                className={`flex items-center gap-2 ${
                  isDarkMode
                    ? "border-red-600/50 text-red-400 hover:bg-red-950/30"
                    : "border-red-300 text-red-700 hover:bg-red-50"
                }`}
              >
                <XCircle className="h-4 w-4" />
                <Badge
                  variant="secondary"
                  className={
                    isDarkMode
                      ? "bg-red-950/50 text-red-400 border-red-600/50"
                      : "bg-red-100 text-red-800 border-red-300"
                  }
                >
                  {invalidCount}
                </Badge>
                Invalid
                <Eye className="h-3 w-3 ml-1" />
              </Button>
            </div>

            {/* Sort Dropdown */}
            <SortDropdown
              value={sortBy}
              onChange={setSortBy}
              isDarkMode={isDarkMode}
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedResults.map((result, index) => (
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

                  {/* Show invalid reason for failed validations */}
                  {!result.is_valid && result.invalid_reason && (
                    <div
                      className={cn(
                        "mt-3 p-3 rounded-md border transition-colors duration-200",
                        result.invalid_reason === "AI Generated"
                          ? isDarkMode
                            ? "bg-amber-950/30 border-amber-700/50 text-amber-200"
                            : "bg-amber-50 border-amber-200 text-amber-800"
                          : isDarkMode
                          ? "bg-purple-950/30 border-purple-700/50 text-purple-200"
                          : "bg-purple-50 border-purple-200 text-purple-800"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-current"></div>
                        <span className="text-sm font-medium">
                          Rejection Reason: {result.invalid_reason}
                        </span>
                      </div>
                      <p className="text-xs mt-1 opacity-80">
                        {result.invalid_reason === "AI Generated"
                          ? "This image was very likely artificially generated by AI."
                          : "This image contains suspicious watermarks indicating AI face manipulation."}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              {index < sortedResults.length - 1 && (
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

      {/* Popups */}
      <ImageListPopup
        isOpen={validPopupOpen}
        onClose={() => setValidPopupOpen(false)}
        images={validFilenames}
        title={`Valid Images (${validCount})`}
        type="valid"
        isDarkMode={isDarkMode}
      />

      <ImageListPopup
        isOpen={invalidPopupOpen}
        onClose={() => setInvalidPopupOpen(false)}
        images={invalidFilenames}
        title={`Invalid Images (${invalidCount})`}
        type="invalid"
        isDarkMode={isDarkMode}
      />
    </Card>
  );
};
