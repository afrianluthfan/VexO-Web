import React, { useRef } from "react";
import {
  FileSpreadsheet,
  XCircle,
  Loader2,
  Sparkles,
  CheckCircle2,
  Download,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useExcelValidation } from "@/lib/hooks/useExcelValidation";

interface ExcelValidationProps {
  isDarkMode?: boolean;
}

export const ExcelValidation: React.FC<ExcelValidationProps> = ({
  isDarkMode = false,
}) => {
  const excelInputRef = useRef<HTMLInputElement>(null);
  const {
    excelFile,
    excelProcessing,
    excelData,
    processedExcelUrl,
    excelDriveUrls,
    handleExcelFileChange,
    processExcelWithGoogleDriveLinks,
    downloadProcessedExcel,
    clearExcelData,
  } = useExcelValidation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleExcelFileChange(file);
    }
  };

  const handleClearExcel = () => {
    clearExcelData();
    if (excelInputRef.current) {
      excelInputRef.current.value = "";
    }
  };

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
          <FileSpreadsheet className="h-5 w-5" />
          Excel File with Google Drive Links
        </CardTitle>
        <CardDescription
          className={`text-sm sm:text-base ${
            isDarkMode ? "text-gray-300" : ""
          }`}
        >
          Upload an Excel file with a SELFIE column containing Google Drive
          sharing links. The system will validate all images from the Google
          Drive URLs and create a new Excel file with validation results.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              onClick={() => excelInputRef.current?.click()}
              variant="outline"
              className="flex-1 order-2 sm:order-1"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Select Excel File</span>
              <span className="sm:hidden">Select File</span>
            </Button>
            {excelFile && (
              <Button
                onClick={handleClearExcel}
                variant="outline"
                className="px-3 sm:px-4 order-3"
              >
                <XCircle className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Clear</span>
              </Button>
            )}
            <Button
              onClick={processExcelWithGoogleDriveLinks}
              disabled={
                !excelFile || excelProcessing || excelDriveUrls.length === 0
              }
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 order-1 sm:order-2"
            >
              {excelProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Processing Excel...</span>
                  <span className="sm:hidden">Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Process Excel</span>
                  <span className="sm:hidden">Process</span>
                </>
              )}
            </Button>
          </div>

          <input
            ref={excelInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />

          {excelFile && (
            <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileSpreadsheet className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="font-medium text-green-900 dark:text-green-200 text-sm sm:text-base">
                  Excel file selected: {excelFile.name}
                </span>
              </div>
              {excelData.length > 0 && (
                <div className="text-xs sm:text-sm text-green-700 dark:text-green-300 mb-1">
                  Found {excelData.length} rows of data
                </div>
              )}
              {excelDriveUrls.length > 0 && (
                <div className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                  Found {excelDriveUrls.length} Google Drive URLs in SELFIE
                  column
                </div>
              )}
            </div>
          )}

          {processedExcelUrl && (
            <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-blue-900 dark:text-blue-200 text-sm sm:text-base">
                    Excel file processed successfully!
                  </span>
                </div>
                <Button
                  onClick={downloadProcessedExcel}
                  size="sm"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
              <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 mt-2">
                The processed file includes validation status, scores, and
                messages for each Google Drive image.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
