"use client";

import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Upload,
  ImageIcon,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  FileImage,
  Sparkles,
  FileSpreadsheet,
  Download,
  Link2,
  Plus,
  Minus,
  Moon,
  Sun,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ValidationResult {
  filename: string;
  is_valid: boolean;
  validity_score: number;
  percentage: number;
  message: string;
  file_id?: string;
  drive_url?: string;
}

interface GoogleDriveResult extends ValidationResult {
  file_id: string;
  drive_url: string;
}

export default function Home() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Excel processing states (Google Drive links)
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

  // Google Drive states
  const [googleDriveUrl, setGoogleDriveUrl] = useState<string>("");
  const [googleDriveUrls, setGoogleDriveUrls] = useState<string[]>([""]);
  const [googleDriveLoading, setGoogleDriveLoading] = useState(false);
  const [googleDriveResults, setGoogleDriveResults] = useState<
    GoogleDriveResult[]
  >([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  const API_BASE_URL = "http://localhost:8000";

  useEffect(() => {
    checkApiHealth();

    // Initialize dark mode from localStorage
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme === "true") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  };

  const checkApiHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const health = await response.json();

      if (!health.models_loaded) {
        setError(
          "API models are not loaded. Please wait for the server to fully initialize."
        );
      }
    } catch {
      setError(
        "Cannot connect to API server. Make sure it's running on http://localhost:8000"
      );
    }
  };

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

  const validateImages = async () => {
    if (!files || files.length === 0) return;

    const formData = new FormData();

    // Handle both single and multiple files with the same endpoint
    if (files.length === 1) {
      formData.append("file", files[0]);

      setLoading(true);
      setResults([]);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/validate`, {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          setResults([result]);
        } else {
          setError(result.detail || "Error validating image");
        }
      } catch (error) {
        setError("Failed to connect to API: " + (error as Error).message);
      } finally {
        setLoading(false);
      }
    } else {
      // Multiple files
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      setLoading(true);
      setResults([]);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/validate_multiple`, {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          setResults(result.results);
        } else {
          setError(result.detail || "Error validating images");
        }
      } catch (error) {
        setError("Failed to connect to API: " + (error as Error).message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setExcelFile(file);
      readExcelFile(file);
    }
  };

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

  // Google Drive validation functions
  const validateGoogleDriveImage = async () => {
    if (!googleDriveUrl.trim()) return;

    setGoogleDriveLoading(true);
    setGoogleDriveResults([]);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/validate_google_drive`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ drive_url: googleDriveUrl.trim() }),
      });

      const result = await response.json();

      if (response.ok) {
        setGoogleDriveResults([result]);
      } else {
        setError(result.detail || "Error validating Google Drive image");
      }
    } catch (error) {
      setError("Failed to connect to API: " + (error as Error).message);
    } finally {
      setGoogleDriveLoading(false);
    }
  };

  const validateMultipleGoogleDriveImages = async () => {
    const validUrls = googleDriveUrls.filter((url) => url.trim());
    if (validUrls.length === 0) return;

    setGoogleDriveLoading(true);
    setGoogleDriveResults([]);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/validate_google_drive_multiple`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ drive_urls: validUrls }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setGoogleDriveResults(result.results);
      } else {
        setError(result.detail || "Error validating Google Drive images");
      }
    } catch (error) {
      setError("Failed to connect to API: " + (error as Error).message);
    } finally {
      setGoogleDriveLoading(false);
    }
  };

  const addGoogleDriveUrl = () => {
    setGoogleDriveUrls([...googleDriveUrls, ""]);
  };

  const removeGoogleDriveUrl = (index: number) => {
    if (googleDriveUrls.length > 1) {
      const newUrls = googleDriveUrls.filter((_, i) => i !== index);
      setGoogleDriveUrls(newUrls);
    }
  };

  const updateGoogleDriveUrl = (index: number, value: string) => {
    const newUrls = [...googleDriveUrls];
    newUrls[index] = value;
    setGoogleDriveUrls(newUrls);
  };

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

        <div className="flex items-center justify-center gap-3 mb-4 relative min-h-fit">
          {/* Dark Mode Toggle */}
          <Button
            onClick={toggleDarkMode}
            variant="outline"
            size="sm"
            className="absolute left-0 top-1/2 -translate-y-1/2"
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
            <Sparkles className="h-8 w-8 text-white" />
          </div>

          <h1
            className={`text-4xl font-bold bg-gradient-to-r ${
              isDarkMode
                ? "from-gray-100 to-gray-300"
                : "from-gray-900 to-gray-600"
            } bg-clip-text z-10`}
          >
            VEXO Image Validation
          </h1>
        </div>

        {/* Google Drive Setup Instructions */}
        <div className="p-3 mb-8 bg-blue-50 dark:bg-blue-900 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-100 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-200">
                Setup Information
              </p>
              <p className="text-blue-700 dark:text-blue-300 mt-1">
                Google Drive integration requires API authentication. Make sure
                your backend is configured with Google Drive credentials.
              </p>
            </div>
          </div>
        </div>

        <section>
          {/* Carousel Container */}
          <div className="relative mb-8 ">
            <Carousel className="w-full max-w-6xl mx-auto">
              <CarouselContent className="min-h-[450px]">
                {/* Slide 1: Image Upload */}
                <CarouselItem>
                  <div className="px-2">
                    <Card
                      className={`shadow-lg border-0 backdrop-blur-sm min-h-[400px] ${
                        isDarkMode
                          ? "bg-gray-800/80 border-gray-700"
                          : "bg-white/80"
                      }`}
                    >
                      <CardHeader>
                        <CardTitle
                          className={`flex items-center gap-2 ${
                            isDarkMode ? "text-gray-100" : ""
                          }`}
                        >
                          <FileImage className="h-5 w-5" />
                          Image Upload & Validation
                        </CardTitle>
                        <CardDescription
                          className={isDarkMode ? "text-gray-300" : ""}
                        >
                          Drag and drop your images or click to browse. Supports
                          multiple file selection.
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
                                {files.length} file{files.length > 1 ? "s" : ""}{" "}
                                selected
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {Array.from(files).map((file, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs"
                                >
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
                              onClick={() => {
                                setFiles(null);
                                setResults([]);
                                if (fileInputRef.current) {
                                  fileInputRef.current.value = "";
                                }
                              }}
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
                              <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Validate Images
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>

                {/* Slide 2: Excel Upload */}
                <CarouselItem>
                  <div className="px-2">
                    <Card
                      className={`justify-center shadow-lg border-0 backdrop-blur-sm min-h-[400px] ${
                        isDarkMode
                          ? "bg-gray-800/80 border-gray-700"
                          : "bg-white/80"
                      }`}
                    >
                      <CardHeader>
                        <CardTitle
                          className={`flex items-center gap-2 ${
                            isDarkMode ? "text-gray-100" : ""
                          }`}
                        >
                          <FileSpreadsheet className="h-5 w-5" />
                          Excel File with Google Drive Links
                        </CardTitle>
                        <CardDescription
                          className={isDarkMode ? "text-gray-300" : ""}
                        >
                          Upload an Excel file with a SELFIE column containing
                          Google Drive sharing links. The system will validate
                          all images from the Google Drive URLs and create a new
                          Excel file with validation results.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex gap-3">
                            <Button
                              onClick={() => excelInputRef.current?.click()}
                              variant="outline"
                              className="flex-1"
                            >
                              <FileSpreadsheet className="h-4 w-4 mr-2" />
                              Select Excel File
                            </Button>
                            {excelFile && (
                              <Button
                                onClick={() => {
                                  setExcelFile(null);
                                  setExcelData([]);
                                  setExcelDriveUrls([]);
                                  setExcelValidationResults([]);
                                  setProcessedExcelUrl(null);
                                  if (excelInputRef.current) {
                                    excelInputRef.current.value = "";
                                  }
                                }}
                                variant="outline"
                                className="px-4"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Clear
                              </Button>
                            )}
                            <Button
                              onClick={processExcelWithGoogleDriveLinks}
                              disabled={
                                !excelFile ||
                                excelProcessing ||
                                excelDriveUrls.length === 0
                              }
                              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                            >
                              {excelProcessing ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Processing Excel...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-4 w-4 mr-2" />
                                  Process Excel
                                </>
                              )}
                            </Button>
                          </div>

                          <input
                            ref={excelInputRef}
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleExcelFileChange}
                            className="hidden"
                          />

                          {excelFile && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                                <span className="font-medium text-green-900">
                                  Excel file selected: {excelFile.name}
                                </span>
                              </div>
                              {excelData.length > 0 && (
                                <div className="text-sm text-green-700 mb-1">
                                  Found {excelData.length} rows of data
                                </div>
                              )}
                              {excelDriveUrls.length > 0 && (
                                <div className="text-sm text-blue-700">
                                  Found {excelDriveUrls.length} Google Drive
                                  URLs in SELFIE column
                                </div>
                              )}
                            </div>
                          )}

                          {processedExcelUrl && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                                  <span className="font-medium text-blue-900">
                                    Excel file processed successfully!
                                  </span>
                                </div>
                                <Button
                                  onClick={downloadProcessedExcel}
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </Button>
                              </div>
                              <p className="text-sm text-blue-700 mt-2">
                                The processed file includes validation status,
                                scores, and messages for each Google Drive
                                image.
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>

                {/* Slide 3: Google Drive */}
                <CarouselItem>
                  <div className="px-2">
                    <Card
                      className={`justify-center shadow-lg border-0 backdrop-blur-sm min-h-[400px] ${
                        isDarkMode
                          ? "bg-gray-800/80 border-gray-700"
                          : "bg-white/80"
                      }`}
                    >
                      <CardHeader>
                        <CardTitle
                          className={`flex items-center gap-2 ${
                            isDarkMode ? "text-gray-100" : ""
                          }`}
                        >
                          <Link2 className="h-5 w-5" />
                          Google Drive Image Validation
                        </CardTitle>
                        <CardDescription
                          className={isDarkMode ? "text-gray-300" : ""}
                        >
                          Validate images directly from Google Drive. Paste a
                          Google Drive sharing link to validate single or
                          multiple images without downloading them.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Single Google Drive URL */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Single Google Drive Image URL
                            </label>
                            <div className="flex gap-2">
                              <Input
                                type="url"
                                value={googleDriveUrl}
                                onChange={(e) =>
                                  setGoogleDriveUrl(e.target.value)
                                }
                                placeholder="https://drive.google.com/file/d/FILE_ID/view?usp=sharing"
                                className="flex-1"
                              />
                              <Button
                                onClick={validateGoogleDriveImage}
                                disabled={
                                  !googleDriveUrl.trim() || googleDriveLoading
                                }
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                              >
                                {googleDriveLoading ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Validating...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Validate
                                  </>
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
                                      updateGoogleDriveUrl(
                                        index,
                                        e.target.value
                                      )
                                    }
                                    placeholder={`Google Drive URL ${
                                      index + 1
                                    }`}
                                    className="flex-1"
                                  />
                                  {googleDriveUrls.length > 1 && (
                                    <Button
                                      onClick={() =>
                                        removeGoogleDriveUrl(index)
                                      }
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
                                googleDriveUrls.filter((url) => url.trim())
                                  .length === 0 || googleDriveLoading
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
                  </div>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious
                className={`${
                  isDarkMode ? "bg-gray-800/80 border-gray-600" : "bg-white/80"
                }`}
              />
              <CarouselNext
                className={`${
                  isDarkMode ? "bg-gray-800/80 border-gray-600" : "bg-white/80"
                }`}
              />
            </Carousel>
          </div>
        </section>
        <div>
          {/* Loading Progress for Excel */}
          {excelProcessing && (
            <Card className="mb-8 border-green-200 bg-green-50/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <Loader2 className="h-5 w-5 text-green-600 animate-spin" />
                  <span className="font-medium text-green-900">
                    Processing Excel file with Google Drive images...
                  </span>
                </div>
                <Progress value={50} className="h-2" />
                <p className="text-sm text-green-700 mt-2">
                  Validating {excelDriveUrls.length} images from Google Drive
                  URLs in your Excel file.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
        {/* Loading Progress */}
        {loading && (
          <Card className="mb-8 border-blue-200 bg-blue-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                <span className="font-medium text-blue-900">
                  Processing your images...
                </span>
              </div>
              <Progress value={33} className="h-2" />
              <p className="text-sm text-blue-700 mt-2">
                AI models are analyzing your images for quality and validity.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Google Drive Loading Progress */}
        {googleDriveLoading && (
          <Card className="mb-8 border-purple-200 bg-purple-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />
                <span className="font-medium text-purple-900">
                  Processing Google Drive images...
                </span>
              </div>
              <Progress value={45} className="h-2" />
              <p className="text-sm text-purple-700 mt-2">
                Downloading and analyzing images from Google Drive.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Error Alert */}
        {error && (
          <Alert className="mb-8 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {results.length > 0 && (
          <Card
            className={`shadow-lg border-0 backdrop-blur-sm ${
              isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80"
            }`}
          >
            <CardHeader>
              <CardTitle
                className={`flex items-center gap-2 ${
                  isDarkMode ? "text-gray-100" : ""
                }`}
              >
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Validation Results
              </CardTitle>
              <CardDescription className={isDarkMode ? "text-gray-300" : ""}>
                {results.length} image{results.length > 1 ? "s" : ""} processed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={index}>
                    <Card
                      className={`transition-all duration-300 ${
                        result.is_valid
                          ? "border-green-200 bg-green-50/50 hover:bg-green-50"
                          : "border-red-200 bg-red-50/50 hover:bg-red-50"
                      }`}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {result.is_valid ? (
                              <CheckCircle2 className="h-6 w-6 text-green-600" />
                            ) : (
                              <XCircle className="h-6 w-6 text-red-600" />
                            )}
                            <div>
                              <h3 className="font-semibold text-lg">
                                {result.filename}
                              </h3>
                              <Badge
                                variant={
                                  result.is_valid ? "default" : "destructive"
                                }
                                className="mt-1"
                              >
                                {result.is_valid ? "VALID" : "INVALID"}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">
                              {result.percentage.toFixed(1)}%
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Score: {result.validity_score.toFixed(4)}
                            </div>
                          </div>
                        </div>

                        <Progress value={result.percentage} className="mb-3" />

                        <p className="text-sm text-muted-foreground bg-background/50 p-3 rounded-md">
                          {result.message}
                        </p>
                      </CardContent>
                    </Card>
                    {index < results.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Excel Validation Results */}
        {excelValidationResults.length > 0 && (
          <Card
            className={`shadow-lg border-0 backdrop-blur-sm mt-8 ${
              isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80"
            }`}
          >
            <CardHeader>
              <CardTitle
                className={`flex items-center gap-2 ${
                  isDarkMode ? "text-gray-100" : ""
                }`}
              >
                <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                Excel Google Drive Validation Results
              </CardTitle>
              <CardDescription className={isDarkMode ? "text-gray-300" : ""}>
                {excelValidationResults.length} images from Excel SELFIE column
                processed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {excelValidationResults.map((result, index) => (
                  <div key={index}>
                    <Card
                      className={`transition-all duration-300 ${
                        result.is_valid
                          ? "border-green-200 bg-green-50/50 hover:bg-green-50"
                          : "border-red-200 bg-red-50/50 hover:bg-red-50"
                      }`}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {result.is_valid ? (
                              <CheckCircle2 className="h-6 w-6 text-green-600" />
                            ) : (
                              <XCircle className="h-6 w-6 text-red-600" />
                            )}
                            <div>
                              <h3 className="font-semibold text-lg">
                                Row {index + 1}: {result.filename}
                              </h3>
                              <div className="flex gap-2 mt-1">
                                <Badge
                                  variant={
                                    result.is_valid ? "default" : "destructive"
                                  }
                                >
                                  {result.is_valid ? "VALID" : "INVALID"}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  Excel + Google Drive
                                </Badge>
                              </div>
                              {result.drive_url && (
                                <a
                                  href={result.drive_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 block"
                                >
                                  View in Google Drive
                                </a>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">
                              {result.percentage.toFixed(1)}%
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Score: {result.validity_score.toFixed(4)}
                            </div>
                            {result.file_id && (
                              <div className="text-xs text-muted-foreground mt-1">
                                ID: {result.file_id.substring(0, 8)}...
                              </div>
                            )}
                          </div>
                        </div>

                        <Progress value={result.percentage} className="mb-3" />

                        <p className="text-sm text-muted-foreground bg-background/50 p-3 rounded-md">
                          {result.message}
                        </p>
                      </CardContent>
                    </Card>
                    {index < excelValidationResults.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Google Drive Results */}
        {googleDriveResults.length > 0 && (
          <Card
            className={`shadow-lg border-0 backdrop-blur-sm mt-8 ${
              isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80"
            }`}
          >
            <CardHeader>
              <CardTitle
                className={`flex items-center gap-2 ${
                  isDarkMode ? "text-gray-100" : ""
                }`}
              >
                <Link2 className="h-5 w-5 text-blue-600" />
                Google Drive Validation Results
              </CardTitle>
              <CardDescription className={isDarkMode ? "text-gray-300" : ""}>
                {googleDriveResults.length} Google Drive image
                {googleDriveResults.length > 1 ? "s" : ""} processed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {googleDriveResults.map((result, index) => (
                  <div key={index}>
                    <Card
                      className={`transition-all duration-300 ${
                        result.is_valid
                          ? "border-green-200 bg-green-50/50 hover:bg-green-50"
                          : "border-red-200 bg-red-50/50 hover:bg-red-50"
                      }`}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {result.is_valid ? (
                              <CheckCircle2 className="h-6 w-6 text-green-600" />
                            ) : (
                              <XCircle className="h-6 w-6 text-red-600" />
                            )}
                            <div>
                              <h3 className="font-semibold text-lg">
                                {result.filename}
                              </h3>
                              <div className="flex gap-2 mt-1">
                                <Badge
                                  variant={
                                    result.is_valid ? "default" : "destructive"
                                  }
                                >
                                  {result.is_valid ? "VALID" : "INVALID"}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  Google Drive
                                </Badge>
                              </div>
                              {result.drive_url && (
                                <a
                                  href={result.drive_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 block"
                                >
                                  View in Google Drive
                                </a>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">
                              {result.percentage.toFixed(1)}%
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Score: {result.validity_score.toFixed(4)}
                            </div>
                            {result.file_id && (
                              <div className="text-xs text-muted-foreground mt-1">
                                ID: {result.file_id.substring(0, 8)}...
                              </div>
                            )}
                          </div>
                        </div>

                        <Progress value={result.percentage} className="mb-3" />

                        <p className="text-sm text-muted-foreground bg-background/50 p-3 rounded-md">
                          {result.message}
                        </p>
                      </CardContent>
                    </Card>
                    {index < googleDriveResults.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
