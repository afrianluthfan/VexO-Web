import { useState, useCallback } from "react";
import { ValidationResult } from "@/types/validation";
import { API_CONFIG } from "@/lib/api-config";

export const useImageValidation = () => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateImages = async () => {
    if (!files || files.length === 0) return;

    console.log("Starting validation with", files.length, "files");
    const formData = new FormData();

    setLoading(true);
    setResults([]);
    setError(null);

    try {
      if (files.length === 1) {
        formData.append("file", files[0]);
        const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VALIDATE}`;
        console.log("Sending single file to", url);

        const response = await fetch(url, {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        console.log("Response:", response.status, result);

        if (response.ok) {
          setResults([result]);
          console.log("Set results:", [result]);
        } else {
          setError(result.detail || "Error validating image");
          console.error("Error from API:", result);
        }
      } else {
        // Multiple files
        for (let i = 0; i < files.length; i++) {
          formData.append("files", files[i]);
        }
        const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VALIDATE_MULTIPLE}`;
        console.log("Sending multiple files to", url);

        const response = await fetch(url, {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        console.log("Response:", response.status, result);

        if (response.ok) {
          setResults(result.results);
          console.log("Set results:", result.results);
        } else {
          setError(result.detail || "Error validating images");
          console.error("Error from API:", result);
        }
      }
    } catch (error) {
      console.error("Network error:", error);
      setError("Failed to connect to API: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const clearFiles = useCallback(() => {
    setFiles(null);
    setResults([]);
    setError(null);
  }, []);

  return {
    files,
    setFiles,
    results,
    loading,
    error,
    validateImages,
    clearFiles,
  };
};
