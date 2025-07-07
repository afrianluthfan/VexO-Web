import React, { useRef, useEffect } from "react";
import { Upload, ImageIcon, XCircle, Loader2, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useImageValidation } from "@/lib/hooks/useImageValidation";
import { ValidationResult } from "@/types/validation";

interface ImageUploadValidationProps {
  isDarkMode?: boolean;
  onResultsChange?: (results: ValidationResult[], loading: boolean) => void;
  onClearFunctionReady?: (clearFn: () => void) => void;
}

export const ImageUploadValidation: React.FC<ImageUploadValidationProps> = ({
  isDarkMode = false,
  onResultsChange,
  onClearFunctionReady,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { files, setFiles, results, loading, validateImages, clearFiles } =
    useImageValidation();

  // Notify parent component when results or loading state change
  useEffect(() => {
    onResultsChange?.(results, loading);
  }, [results, loading, onResultsChange]);

  // Provide clear function to parent component
  useEffect(() => {
    onClearFunctionReady?.(clearFiles);
  }, [onClearFunctionReady, clearFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("border-blue-500", "bg-blue-50");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-blue-500", "bg-blue-50");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-blue-500", "bg-blue-50");

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      setFiles(droppedFiles);
    }
  };

  const handleClearFiles = () => {
    clearFiles();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card
      className={`shadow-lg border-0 backdrop-blur-sm min-h-[350px] sm:min-h-[400px] lg:min-h-[450px] ${
        isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80"
      }`}
    >
      <CardHeader className="pb-4 sm:pb-6">
        <CardTitle
          className={`flex items-center gap-2 text-lg sm:text-xl ${
            isDarkMode ? "text-gray-100" : ""
          }`}
        >
          <Upload className="h-5 w-5" />
          Image Upload & Validation
        </CardTitle>
        <CardDescription
          className={`text-sm sm:text-base ${
            isDarkMode ? "text-gray-300" : ""
          }`}
        >
          Drag and drop your images or click to browse. Supports multiple file
          selection.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div
          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 sm:p-6 lg:p-8 text-center transition-all duration-300 hover:border-primary/50 hover:bg-primary/5 cursor-pointer group"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <div>
              <p className="text-base sm:text-lg font-medium text-foreground mb-1">
                Drop your images here
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                or click to browse files
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {files && files.length > 0 && (
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-blue-900 dark:text-blue-200 text-sm sm:text-base">
                {files.length} file{files.length > 1 ? "s" : ""} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-1 sm:gap-2 max-h-24 overflow-y-auto">
              {Array.from(files).map((file, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs max-w-32 sm:max-w-48 truncate"
                >
                  {file.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="flex-1 order-2 sm:order-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Select Images</span>
            <span className="sm:hidden">Select</span>
          </Button>
          {files && files.length > 0 && (
            <Button
              onClick={handleClearFiles}
              variant="outline"
              className="px-3 sm:px-4 order-3"
            >
              <XCircle className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          )}
          <Button
            onClick={validateImages}
            disabled={!files || files.length === 0 || loading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 order-1 sm:order-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                <span className="hidden sm:inline">Processing...</span>
                <span className="sm:hidden">Processing</span>
              </>
            ) : (
              <p className="text-white flex items-center">
                <Sparkles className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Validate Images</span>
                <span className="sm:hidden">Validate</span>
              </p>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
