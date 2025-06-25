"use client";

import { useState, useRef, useEffect } from "react";
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_BASE_URL = "https://73rz9n8v-8000.asse.devtunnels.ms";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              VEXO Image Validation
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Advanced AI-powered image validation system. Upload single or
            multiple images for instant quality assessment.
          </p>
        </div>

        {/* Main Upload Card */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileImage className="h-5 w-5" />
              Image Upload & Validation
            </CardTitle>
            <CardDescription>
              Drag and drop your images or click to browse. Supports multiple
              file selection.
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
