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
      className={`shadow-lg border-0 backdrop-blur-sm min-h-[400px] ${
        isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80"
      }`}
    >
      <CardHeader>
        <CardTitle
          className={`flex items-center gap-2 ${
            isDarkMode ? "text-gray-100" : ""
          }`}
        >
          <Upload className="h-5 w-5" />
          Image Upload & Validation
        </CardTitle>
        <CardDescription className={isDarkMode ? "text-gray-300" : ""}>
          Drag and drop your images or click to browse. Supports multiple file
          selection.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center transition-all duration-300 hover:border-primary/50 hover:bg-primary/5 cursor-pointer group"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium text-foreground mb-1">
                Drop your images here
              </p>
              <p className="text-sm text-muted-foreground">
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
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">
                {files.length} file{files.length > 1 ? "s" : ""} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from(files).map((file, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {file.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            Select Images
          </Button>
          {files && files.length > 0 && (
            <Button
              onClick={handleClearFiles}
              variant="outline"
              className="px-4"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
          <Button
            onClick={validateImages}
            disabled={!files || files.length === 0 || loading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <p className="text-white flex">
                <Sparkles className="h-4 w-4 mr-2" />
                Validate Images
              </p>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
