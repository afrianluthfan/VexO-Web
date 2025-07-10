import { useState, useEffect } from "react";
import { API_CONFIG } from "@/lib/api-config";

interface ModelInfo {
  model_name: string;
  model_path: string;
  models_loaded: boolean;
  model_type: string;
  description: string;
}

export const useModelInfo = () => {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModelInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_CONFIG.BASE_URL}/model_info`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setModelInfo(data);
    } catch (err) {
      console.error("Error fetching model info:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch model info"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModelInfo();
  }, []);

  return {
    modelInfo,
    loading,
    error,
    refetch: fetchModelInfo,
  };
};
