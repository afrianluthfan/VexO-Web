import { useState, useEffect } from "react";

export const useApiHealth = () => {
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = "http://localhost:8000";

  const checkApiHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
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
        "Cannot connect to API server. Make sure it's running on http://localhost:8000"
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
