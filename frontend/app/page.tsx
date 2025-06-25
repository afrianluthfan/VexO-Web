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
} from "lucide-react";

interface ValidationResult {
  filename: string;
  is_valid: boolean;
  validity_score: number;
  percentage: number;
  message: string;
}

export default function Home() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Excel processing states
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelProcessing, setExcelProcessing] = useState(false);
  const [excelData, setExcelData] = useState<Record<string, unknown>[]>([]);
  const [processedExcelUrl, setProcessedExcelUrl] = useState<string | null>(
    null
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  const API_BASE_URL = "http://localhost:8000";

  useEffect(() => {
    checkApiHealth();
  }, []);

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
    };
    reader.readAsArrayBuffer(file);
  };

  const processExcelFile = async () => {
    if (!excelFile) return;

    const formData = new FormData();
    formData.append("file", excelFile);

    setExcelProcessing(true);
    setError(null);
    setProcessedExcelUrl(null);

    try {
      const response = await fetch(`${API_BASE_URL}/process_excel`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setProcessedExcelUrl(url);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Error processing Excel file");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent z-10">
              VEXO Image Validation
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Advanced AI-powered image validation system. Upload single or
            multiple images for instant quality assessment.
          </p>
        </div>

        <section>
          {/* Main Upload Card */}
          <div className="flex w-full gap-8 justify-between">
            <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileImage className="h-5 w-5" />
                  Image Upload & Validation
                </CardTitle>
                <CardDescription>
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

            {/* Excel Upload Section */}
            <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Excel File Processing
                </CardTitle>
                <CardDescription>
                  Upload an Excel file with columns: PROVIDER, NOMOR REKENING,
                  NOMOR HP, NAMA, TANGGAL PEMBUKAAN, KTP, SELFIE. The SELFIE
                  column should contain base64 encoded images that will be
                  validated.
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
                      onClick={processExcelFile}
                      disabled={!excelFile || excelProcessing}
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
                        <div className="text-sm text-green-700">
                          Found {excelData.length} rows of data
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
                        The processed file includes a NOTES column with
                        validation results for each SELFIE image.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            {/* Loading Progress for Excel */}
            {excelProcessing && (
              <Card className="mb-8 border-green-200 bg-green-50/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Loader2 className="h-5 w-5 text-green-600 animate-spin" />
                    <span className="font-medium text-green-900">
                      Processing your Excel file...
                    </span>
                  </div>
                  <Progress value={50} className="h-2" />
                  <p className="text-sm text-green-700 mt-2">
                    AI models are analyzing the SELFIE images in your Excel
                    file.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
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
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Validation Results
              </CardTitle>
              <CardDescription>
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
      </div>
    </div>
  );
}
