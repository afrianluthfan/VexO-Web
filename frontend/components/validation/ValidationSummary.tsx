import React, { useState } from "react";
import { CheckCircle2, XCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ValidationResult, GoogleDriveResult } from "@/types/validation";

interface ValidationSummaryProps {
  results: ValidationResult[] | GoogleDriveResult[];
  title: string;
  isDarkMode: boolean;
}

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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
};

export const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  results,
  title,
  isDarkMode,
}) => {
  const [validPopupOpen, setValidPopupOpen] = useState(false);
  const [invalidPopupOpen, setInvalidPopupOpen] = useState(false);

  // Calculate valid and invalid counts
  const validImages = results.filter((result) => result.is_valid);
  const invalidImages = results.filter((result) => !result.is_valid);

  const validCount = validImages.length;
  const invalidCount = invalidImages.length;
  const totalCount = results.length;

  // Get filenames for popups
  const validFilenames = validImages.map((result) => result.filename);
  const invalidFilenames = invalidImages.map((result) => result.filename);

  if (totalCount === 0) return null;

  return (
    <>
      <Card
        className={`mb-6 ${
          isDarkMode
            ? "bg-gray-800/80 border-gray-700"
            : "bg-white/80 border-gray-200"
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3
              className={`text-lg font-semibold ${
                isDarkMode ? "text-gray-100" : "text-gray-900"
              }`}
            >
              {title} Summary
            </h3>
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

              {/* Total Count */}
              <div
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Total: {totalCount}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
    </>
  );
};
