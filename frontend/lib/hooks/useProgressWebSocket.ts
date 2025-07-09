import { useState, useEffect, useRef, useCallback } from "react";

interface ProgressData {
  type: string;
  session_id: string;
  total_items: number;
  processed_items: number;
  current_item: string;
  percentage: number;
  status: "idle" | "processing" | "completed" | "error";
  message: string;
}

export const useProgressWebSocket = () => {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const generateSessionId = useCallback(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const connect = useCallback(
    (sessionId?: string) => {
      const id = sessionId || generateSessionId();
      sessionIdRef.current = id;

      try {
        // Use the correct WebSocket URL for your backend
        const wsUrl = `ws://localhost:8000/ws/progress/${id}`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log(`WebSocket connected for session: ${id}`);
          setIsConnected(true);
          setError(null);
        };

        ws.onmessage = (event) => {
          try {
            const data: ProgressData = JSON.parse(event.data);
            console.log("Progress update received:", data);
            setProgressData(data);
          } catch (err) {
            console.error("Error parsing WebSocket message:", err);
          }
        };

        ws.onclose = () => {
          console.log(`WebSocket disconnected for session: ${id}`);
          setIsConnected(false);
        };

        ws.onerror = (error) => {
          console.error(`WebSocket error for session: ${id}`, error);
          setError("WebSocket connection error");
          setIsConnected(false);
        };

        websocketRef.current = ws;
        return id;
      } catch (err) {
        console.error("Error creating WebSocket connection:", err);
        setError("Failed to create WebSocket connection");
        return null;
      }
    },
    [generateSessionId]
  );

  const disconnect = useCallback(() => {
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
    setIsConnected(false);
    setProgressData(null);
    sessionIdRef.current = null;
  }, []);

  const sendPing = useCallback(() => {
    if (
      websocketRef.current &&
      websocketRef.current.readyState === WebSocket.OPEN
    ) {
      websocketRef.current.send("ping");
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // Send periodic pings to keep connection alive
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(sendPing, 30000); // Send ping every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isConnected, sendPing]);

  return {
    progressData,
    isConnected,
    error,
    sessionId: sessionIdRef.current,
    connect,
    disconnect,
  };
};
