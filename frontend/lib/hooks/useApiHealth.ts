import { useState, useEffect } from "react";
import { API_CONFIG } from "@/lib/api-config";

export const useApiHealth = () => {
  const [error, setError] = useState<string | null>(null);

  const checkApiHealth = async () => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HEALTH}`
      );
      const health = await response.json();

      if (!health.models_loaded) {
        setError(
          "API models are not loaded. Please wait for the server to fully initialize."
        );
      } else {
        setError(null);
      }
    } catch {
      setError(
        `Cannot connect to API server. Make sure it's running on ${API_CONFIG.BASE_URL}`
      );
    }
  };

  useEffect(() => {
    checkApiHealth();
  }, []);

  return {
    error,
    checkApiHealth,
  };
};
