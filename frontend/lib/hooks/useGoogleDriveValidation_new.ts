import { useState, useCallback } from "react";
import { GoogleDriveResult } from "@/types/validation";
import { API_CONFIG } from "@/lib/api-config";
import { useProgressWebSocket } from "./useProgressWebSocket";

export const useGoogleDriveValidation = () => {
  const [googleDriveUrl, setGoogleDriveUrl] = useState<string>("");
  const [googleDriveUrls, setGoogleDriveUrls] = useState<string[]>([""]);
  const [googleDriveLoading, setGoogleDriveLoading] = useState(false);
  const [googleDriveResults, setGoogleDriveResults] = useState<
    GoogleDriveResult[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  const {
    progressData,
    connect: connectWS,
    disconnect: disconnectWS,
  } = useProgressWebSocket();

  const validateGoogleDriveImage = async () => {
    if (!googleDriveUrl.trim()) return;

    setGoogleDriveLoading(true);
    setGoogleDriveResults([]);
    setError(null);

    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VALIDATE_GOOGLE_DRIVE}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ drive_url: googleDriveUrl.trim() }),
        }
      );

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
      if (validUrls.length === 1) {
        // For single URL, use the original endpoint
        const response = await fetch(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VALIDATE_GOOGLE_DRIVE}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ drive_url: validUrls[0] }),
          }
        );

        const result = await response.json();

        if (response.ok) {
          setGoogleDriveResults([result]);
        } else {
          setError(result.detail || "Error validating Google Drive image");
        }
      } else {
        // For multiple URLs, use progress-enabled endpoint
        const newSessionId = connectWS();
        if (!newSessionId) {
          setError("Failed to establish progress connection");
          return;
        }

        const response = await fetch(
          `${API_CONFIG.BASE_URL}/validate_google_drive_multiple_with_progress/${newSessionId}`,
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

        // Disconnect WebSocket after completion
        setTimeout(() => {
          disconnectWS();
        }, 2000);
      }
    } catch (error) {
      setError("Failed to connect to API: " + (error as Error).message);
      disconnectWS();
    } finally {
      setGoogleDriveLoading(false);
    }
  };

  const addGoogleDriveUrl = useCallback(() => {
    setGoogleDriveUrls([...googleDriveUrls, ""]);
  }, [googleDriveUrls]);

  const removeGoogleDriveUrl = useCallback(
    (index: number) => {
      if (googleDriveUrls.length > 1) {
        const newUrls = googleDriveUrls.filter((_, i) => i !== index);
        setGoogleDriveUrls(newUrls);
      }
    },
    [googleDriveUrls]
  );

  const updateGoogleDriveUrl = useCallback(
    (index: number, value: string) => {
      const newUrls = [...googleDriveUrls];
      newUrls[index] = value;
      setGoogleDriveUrls(newUrls);
    },
    [googleDriveUrls]
  );

  const clearGoogleDriveResults = useCallback(() => {
    setGoogleDriveUrl("");
    setGoogleDriveUrls([""]);
    setGoogleDriveResults([]);
    setError(null);
    disconnectWS();
  }, [disconnectWS]);

  return {
    googleDriveUrl,
    setGoogleDriveUrl,
    googleDriveUrls,
    googleDriveLoading,
    googleDriveResults,
    progressData,
    error,
    validateGoogleDriveImage,
    validateMultipleGoogleDriveImages,
    addGoogleDriveUrl,
    removeGoogleDriveUrl,
    updateGoogleDriveUrl,
    clearGoogleDriveResults,
  };
};
