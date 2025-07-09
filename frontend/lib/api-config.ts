/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

// Get API base URL from environment variables
const getApiBaseUrl = (): string => {
  // Next.js environment variables must be prefixed with NEXT_PUBLIC_ to be available in the browser
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

  if (apiUrl) {
    return apiUrl;
  }

  // Fallback to localhost in development
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:8000";
  }

  // In production, you should always set NEXT_PUBLIC_API_URL
  throw new Error(
    "API URL not configured. Please set NEXT_PUBLIC_API_URL environment variable."
  );
};

// Get boolean environment variable with default
const getBooleanEnv = (key: string, defaultValue: boolean = false): boolean => {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === "true";
};

// Export API configuration
export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  ENDPOINTS: {
    HEALTH: "/health",
    VALIDATE: "/validate",
    VALIDATE_MULTIPLE: "/validate_multiple",
    PROCESS_EXCEL: "/process_excel",
    UPLOAD_ZIP: "/upload_zip",
    VALIDATE_GOOGLE_DRIVE: "/validate_google_drive",
    VALIDATE_GOOGLE_DRIVE_MULTIPLE: "/validate_google_drive_multiple",
  },
  TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || "30000", 10),
  RETRY_ATTEMPTS: parseInt(
    process.env.NEXT_PUBLIC_API_RETRY_ATTEMPTS || "3",
    10
  ),
} as const;

// Application configuration from environment variables
export const APP_CONFIG = {
  TITLE: process.env.NEXT_PUBLIC_APP_TITLE || "VEXO Image Validation",
  DESCRIPTION:
    process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
    "AI-powered image validation and analysis tool",
  DEFAULT_THEME: process.env.NEXT_PUBLIC_DEFAULT_THEME || "system",

  // Feature flags
  FEATURES: {
    GOOGLE_DRIVE: getBooleanEnv("NEXT_PUBLIC_ENABLE_GOOGLE_DRIVE", true),
    EXCEL_PROCESSING: getBooleanEnv(
      "NEXT_PUBLIC_ENABLE_EXCEL_PROCESSING",
      true
    ),
    BATCH_VALIDATION: getBooleanEnv(
      "NEXT_PUBLIC_ENABLE_BATCH_VALIDATION",
      true
    ),
    DARK_MODE: getBooleanEnv("NEXT_PUBLIC_ENABLE_DARK_MODE", true),
  },

  // Development settings
  DEV: {
    DEBUG_MODE: getBooleanEnv("NEXT_PUBLIC_DEBUG_MODE", false),
    SHOW_DEV_TOOLS: getBooleanEnv("NEXT_PUBLIC_SHOW_DEV_TOOLS", false),
  },
} as const;

// Helper function to build full URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function for fetch with timeout
export const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout: number = API_CONFIG.TIMEOUT
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};
