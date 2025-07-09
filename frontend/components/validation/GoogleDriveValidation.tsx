import React, { useEffect } from "react";
import { Link2, Loader2, Sparkles, Plus, Minus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useGoogleDriveValidation } from "@/lib/hooks/useGoogleDriveValidation";
import { GoogleDriveResult } from "@/types/validation";
import { GoogleDriveSetupError } from "@/components/common/GoogleDriveSetupError";

interface GoogleDriveValidationProps {
  isDarkMode?: boolean;
  onResultsChange?: (
    results: GoogleDriveResult[],
    loading: boolean,
    progressData?: {
      total_items: number;
      processed_items: number;
      current_item: string;
      percentage: number;
      status: string;
      message: string;
    } | null
  ) => void;
  onClearFunctionReady?: (clearFn: () => void) => void;
}

export const GoogleDriveValidation: React.FC<GoogleDriveValidationProps> = ({
  isDarkMode = false,
  onResultsChange,
  onClearFunctionReady,
}) => {
  const {
    googleDriveUrl,
    setGoogleDriveUrl,
    googleDriveUrls,
    googleDriveLoading,
    googleDriveResults,
    progressData,
    error,
    isCredentialsError,
    validateGoogleDriveImage,
    validateMultipleGoogleDriveImages,
    addGoogleDriveUrl,
    removeGoogleDriveUrl,
    updateGoogleDriveUrl,
    clearGoogleDriveResults,
  } = useGoogleDriveValidation();

  // Notify parent component when results or loading state change
  useEffect(() => {
    onResultsChange?.(googleDriveResults, googleDriveLoading, progressData);
  }, [googleDriveResults, googleDriveLoading, progressData, onResultsChange]);

  // Provide clear function to parent component
  useEffect(() => {
    onClearFunctionReady?.(clearGoogleDriveResults);
  }, [onClearFunctionReady, clearGoogleDriveResults]);

  return (
    <Card
      className={`justify-center shadow-lg border-0 backdrop-blur-sm min-h-[350px] sm:min-h-[400px] lg:min-h-[450px] ${
        isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80"
      }`}
    >
      <CardHeader className="pb-4 sm:pb-6">
        <CardTitle
          className={`flex items-center gap-2 text-lg sm:text-xl ${
            isDarkMode ? "text-gray-100" : ""
          }`}
        >
          <Link2 className="h-5 w-5" />
          Google Drive Image Validation
        </CardTitle>
        <CardDescription
          className={`text-sm sm:text-base ${
            isDarkMode ? "text-gray-300" : ""
          }`}
        >
          Validate images directly from Google Drive. Paste a Google Drive
          sharing link to validate single or multiple images without downloading
          them.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        {/* Google Drive Setup Error */}
        {isCredentialsError && error && (
          <GoogleDriveSetupError isDarkMode={isDarkMode} error={error} />
        )}

        <div className="space-y-4">
          {/* Single Google Drive URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Single Google Drive Image URL
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="url"
                value={googleDriveUrl}
                onChange={(e) => setGoogleDriveUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/FILE_ID/view?usp=sharing"
                className="flex-1 text-sm"
              />
              <Button
                onClick={validateGoogleDriveImage}
                disabled={!googleDriveUrl.trim() || googleDriveLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full sm:w-auto"
              >
                {googleDriveLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span className="hidden sm:inline">Validating...</span>
                    <span className="sm:hidden">Validating</span>
                  </>
                ) : (
                  <p className="text-white flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Validate</span>
                    <span className="sm:hidden">Validate</span>
                  </p>
                )}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Multiple Google Drive URLs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Multiple Google Drive Image URLs
              </label>
              <Button
                onClick={addGoogleDriveUrl}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add URL
              </Button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {googleDriveUrls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="url"
                    value={url}
                    onChange={(e) =>
                      updateGoogleDriveUrl(index, e.target.value)
                    }
                    placeholder={`Google Drive URL ${index + 1}`}
                    className="flex-1"
                  />
                  {googleDriveUrls.length > 1 && (
                    <Button
                      onClick={() => removeGoogleDriveUrl(index)}
                      size="sm"
                      variant="outline"
                      className="px-2"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              onClick={validateMultipleGoogleDriveImages}
              disabled={
                googleDriveUrls.filter((url) => url.trim()).length === 0 ||
                googleDriveLoading
              }
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {googleDriveLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Validating Multiple...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Validate All URLs
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
