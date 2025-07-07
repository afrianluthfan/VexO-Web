import React from "react";
import { CheckCircle2, FileSpreadsheet, Link2 } from "lucide-react";
import { ValidationResults } from "../common/ValidationResults";
import { ValidationResult, GoogleDriveResult } from "@/types/validation";

interface AllValidationResultsProps {
  imageResults: ValidationResult[];
  excelResults: ValidationResult[];
  googleDriveResults: GoogleDriveResult[];
  isDarkMode: boolean;
}

export const AllValidationResults: React.FC<AllValidationResultsProps> = ({
  imageResults,
  excelResults,
  googleDriveResults,
  isDarkMode,
}) => {
  return (
    <>
      {/* Image Upload Results */}
      {imageResults.length > 0 && (
        <ValidationResults
          results={imageResults}
          title="Validation Results"
          description={`${imageResults.length} image${
            imageResults.length > 1 ? "s" : ""
          } processed`}
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
          variant="default"
          isDarkMode={isDarkMode}
        />
      )}

      {/* Excel Results */}
      {excelResults.length > 0 && (
        <div className="mt-8">
          <ValidationResults
            results={excelResults}
            title="Excel Google Drive Validation Results"
            description={`${excelResults.length} images from Excel SELFIE column processed`}
            icon={<FileSpreadsheet className="h-5 w-5 text-emerald-600" />}
            variant="excel"
            isDarkMode={isDarkMode}
          />
        </div>
      )}

      {/* Google Drive Results */}
      {googleDriveResults.length > 0 && (
        <div className="mt-8">
          <ValidationResults
            results={googleDriveResults}
            title="Google Drive Validation Results"
            description={`${googleDriveResults.length} Google Drive image${
              googleDriveResults.length > 1 ? "s" : ""
            } processed`}
            icon={<Link2 className="h-5 w-5 text-blue-600" />}
            variant="google-drive"
            isDarkMode={isDarkMode}
          />
        </div>
      )}
    </>
  );
};
