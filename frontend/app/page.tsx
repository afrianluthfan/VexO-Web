"use client";

import React, { useState, useCallback } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";
import { AppHeader } from "@/components/common/AppHeader";
import { GoogleDriveSetupInfo } from "@/components/common/GoogleDriveSetupInfo";
import { ValidationCarousel } from "@/components/validation/ValidationCarousel";
import { AllValidationResults } from "@/components/validation/AllValidationResults";
import { LoadingProgress } from "@/components/common/LoadingProgress";
import { useExcelValidation } from "@/lib/hooks/useExcelValidation";
import { useDarkMode } from "@/lib/hooks/useDarkMode";
import { useApiHealth } from "@/lib/hooks/useApiHealth";
import { ValidationResult, GoogleDriveResult } from "@/types/validation";

export default function Home() {
  // Custom hooks for all functionality
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { error: apiError } = useApiHealth();

  // Local state for image validation results (managed by child component)
  const [imageResults, setImageResults] = useState<ValidationResult[]>([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageClearFunction, setImageClearFunction] = useState<
    (() => void) | null
  >(null);

  // Local state for Google Drive validation results (managed by child component)
  const [googleDriveResults, setGoogleDriveResults] = useState<
    GoogleDriveResult[]
  >([]);
  const [googleDriveLoading, setGoogleDriveLoading] = useState(false);
  const [googleDriveClearFunction, setGoogleDriveClearFunction] = useState<
    (() => void) | null
  >(null);

  const {
    excelValidationResults,
    excelProcessing,
    excelDriveUrls,
    error: excelError,
  } = useExcelValidation();

  // Combine all errors
  const allErrors = [apiError, excelError].filter(Boolean);
  const hasErrors = allErrors.length > 0;

  // Callback for image validation results
  const handleImageResultsChange = useCallback(
    (results: ValidationResult[], loading: boolean) => {
      setImageResults(results);
      setImageLoading(loading);
    },
    []
  );

  // Callback for Google Drive validation results
  const handleGoogleDriveResultsChange = useCallback(
    (results: GoogleDriveResult[], loading: boolean) => {
      setGoogleDriveResults(results);
      setGoogleDriveLoading(loading);
    },
    []
  );

  // Callbacks for clear functions
  const handleImageClearFunctionReady = useCallback((clearFn: () => void) => {
    setImageClearFunction(() => clearFn);
  }, []);

  const handleGoogleDriveClearFunctionReady = useCallback(
    (clearFn: () => void) => {
      setGoogleDriveClearFunction(() => clearFn);
    },
    []
  );

  // Clear all results
  const clearAllResults = useCallback(() => {
    // Clear image validation results
    if (imageClearFunction) {
      imageClearFunction();
    }

    // Clear Google Drive validation results
    if (googleDriveClearFunction) {
      googleDriveClearFunction();
    }

    // Clear local state
    setImageResults([]);
    setGoogleDriveResults([]);

    // Note: Excel results are managed by the hook, we'd need to add a clear method to that hook too
  }, [imageClearFunction, googleDriveClearFunction]);

  // Debug logging - fixed infinite render issue
  console.log(
    "Page render - imageResults:",
    imageResults.length,
    "excelResults:",
    excelValidationResults.length,
    "googleDriveResults:",
    googleDriveResults.length
  );

  return (
    <div
      className={`min-h-screen transition-colors duration-300 p-4 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 to-gray-800"
          : "bg-gradient-to-br from-slate-50 to-slate-100"
      }`}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <AppHeader isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />

        {/* Google Drive Setup Instructions */}
        <GoogleDriveSetupInfo />

        {/* Validation Carousel */}
        <ValidationCarousel
          isDarkMode={isDarkMode}
          onImageResultsChange={handleImageResultsChange}
          onGoogleDriveResultsChange={handleGoogleDriveResultsChange}
          onImageClearFunctionReady={handleImageClearFunctionReady}
          onGoogleDriveClearFunctionReady={handleGoogleDriveClearFunctionReady}
        />

        {/* Clear Results Button */}
        {(imageResults.length > 0 ||
          googleDriveResults.length > 0 ||
          excelValidationResults.length > 0) && (
          <div className="flex justify-center mb-6">
            <Button
              onClick={clearAllResults}
              variant="outline"
              className={`flex items-center gap-2 ${
                isDarkMode
                  ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Trash2 className="h-4 w-4" />
              Clear All Results
            </Button>
          </div>
        )}

        {/* Loading Progress Indicators */}
        {imageLoading && (
          <LoadingProgress
            message="Processing your images..."
            description="AI models are analyzing your images for quality and validity."
            progress={33}
            variant="blue"
            isDarkMode={isDarkMode}
          />
        )}

        {excelProcessing && (
          <LoadingProgress
            message="Processing Excel file with Google Drive images..."
            description={`Validating ${excelDriveUrls.length} images from Google Drive URLs in your Excel file.`}
            progress={50}
            variant="green"
            isDarkMode={isDarkMode}
          />
        )}

        {googleDriveLoading && (
          <LoadingProgress
            message="Processing Google Drive images..."
            description="Downloading and analyzing images from Google Drive."
            progress={45}
            variant="purple"
            isDarkMode={isDarkMode}
          />
        )}

        {/* Error Alert */}
        {hasErrors && (
          <Alert className="mb-8 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {allErrors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </AlertDescription>
          </Alert>
        )}

        {/* All Validation Results */}
        <AllValidationResults
          imageResults={imageResults}
          excelResults={excelValidationResults}
          googleDriveResults={googleDriveResults}
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  );
}
