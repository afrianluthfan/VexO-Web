import { useState } from "react";
import * as XLSX from "xlsx";
import { ValidationResult } from "@/types/validation";

export const useExcelValidation = () => {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelProcessing, setExcelProcessing] = useState(false);
  const [excelData, setExcelData] = useState<Record<string, unknown>[]>([]);
  const [processedExcelUrl, setProcessedExcelUrl] = useState<string | null>(
    null
  );
  const [excelDriveUrls, setExcelDriveUrls] = useState<string[]>([]);
  const [excelValidationResults, setExcelValidationResults] = useState<
    ValidationResult[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = "http://localhost:8000";

  const readExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      setExcelData(jsonData as Record<string, unknown>[]);

      // Extract Google Drive URLs from SELFIE column
      const selfieUrls = (jsonData as Record<string, unknown>[])
        .map((row) => row.SELFIE as string)
        .filter(
          (url) => url && typeof url === "string" && url.trim().length > 0
        );

      setExcelDriveUrls(selfieUrls);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExcelFileChange = (file: File) => {
    setExcelFile(file);
    readExcelFile(file);
  };

  const processExcelWithGoogleDriveLinks = async () => {
    if (!excelFile || excelDriveUrls.length === 0) return;

    setExcelProcessing(true);
    setError(null);
    setExcelValidationResults([]);
    setProcessedExcelUrl(null);

    try {
      // Validate all Google Drive URLs from Excel
      const response = await fetch(
        `${API_BASE_URL}/validate_google_drive_multiple`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ drive_urls: excelDriveUrls }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setExcelValidationResults(result.results);

        // Create a new Excel file with validation results
        const enhancedData = excelData.map((row, index) => ({
          ...row,
          VALIDATION_STATUS: result.results[index]?.is_valid
            ? "VALID"
            : "INVALID",
          VALIDATION_SCORE:
            result.results[index]?.percentage?.toFixed(1) + "%" || "N/A",
          VALIDATION_MESSAGE:
            result.results[index]?.message || "No validation performed",
        }));

        // Create new workbook with enhanced data
        const newWorkbook = XLSX.utils.book_new();
        const newWorksheet = XLSX.utils.json_to_sheet(enhancedData);
        XLSX.utils.book_append_sheet(
          newWorkbook,
          newWorksheet,
          "Validated Data"
        );

        // Generate blob and download URL
        const excelBuffer = XLSX.write(newWorkbook, {
          bookType: "xlsx",
          type: "array",
        });
        const blob = new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        setProcessedExcelUrl(url);
      } else {
        setError(
          result.detail || "Error processing Excel file with Google Drive links"
        );
      }
    } catch (error) {
      setError("Failed to connect to API: " + (error as Error).message);
    } finally {
      setExcelProcessing(false);
    }
  };

  const downloadProcessedExcel = () => {
    if (processedExcelUrl) {
      const link = document.createElement("a");
      link.href = processedExcelUrl;
      link.download = `processed_${excelFile?.name || "excel_file.xlsx"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const clearExcelData = () => {
    setExcelFile(null);
    setExcelData([]);
    setExcelDriveUrls([]);
    setExcelValidationResults([]);
    setProcessedExcelUrl(null);
    setError(null);
  };

  return {
    excelFile,
    excelProcessing,
    excelData,
    processedExcelUrl,
    excelDriveUrls,
    excelValidationResults,
    error,
    handleExcelFileChange,
    processExcelWithGoogleDriveLinks,
    downloadProcessedExcel,
    clearExcelData,
  };
};
