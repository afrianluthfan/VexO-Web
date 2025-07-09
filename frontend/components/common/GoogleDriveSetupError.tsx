import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ExternalLink, Settings } from "lucide-react";

interface GoogleDriveSetupErrorProps {
  isDarkMode?: boolean;
  error: string;
}

export const GoogleDriveSetupError: React.FC<GoogleDriveSetupErrorProps> = ({
  isDarkMode = false,
  error,
}) => {
  const openSetupGuide = () => {
    // You can link to your setup documentation or Google Cloud Console
    window.open("https://console.cloud.google.com/", "_blank");
  };

  return (
    <Alert
      className={`mb-6 border-amber-200 ${
        isDarkMode ? "bg-amber-950/30 border-amber-600/50" : "bg-amber-50"
      }`}
    >
      <AlertTriangle
        className={`h-5 w-5 ${
          isDarkMode ? "text-amber-400" : "text-amber-600"
        }`}
      />
      <AlertTitle
        className={`text-lg font-semibold ${
          isDarkMode ? "text-amber-100" : "text-amber-900"
        }`}
      >
        Google Drive Setup Required
      </AlertTitle>
      <AlertDescription className="space-y-4">
        <div
          className={`text-sm ${
            isDarkMode ? "text-amber-200" : "text-amber-800"
          }`}
        >
          <p className="mb-2">
            <strong>Issue:</strong> {error}
          </p>
          <p className="mb-3">
            To use Google Drive validation, you need to set up Google Cloud
            credentials:
          </p>

          <div className="space-y-2 ml-4">
            <div className="flex items-start gap-2">
              <span className="font-mono text-xs bg-amber-100 dark:bg-amber-900/50 px-1 rounded">
                1.
              </span>
              <span>
                Create a Google Cloud Project and enable the Google Drive API
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-mono text-xs bg-amber-100 dark:bg-amber-900/50 px-1 rounded">
                2.
              </span>
              <span>
                Set up OAuth2 credentials for a &ldquo;Desktop
                Application&rdquo;
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-mono text-xs bg-amber-100 dark:bg-amber-900/50 px-1 rounded">
                3.
              </span>
              <span>Download the credentials JSON file</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-mono text-xs bg-amber-100 dark:bg-amber-900/50 px-1 rounded">
                4.
              </span>
              <span>
                Save it as{" "}
                <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded text-xs">
                  credentials.json
                </code>{" "}
                in the backend directory
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            onClick={openSetupGuide}
            variant="outline"
            size="sm"
            className={`flex items-center gap-2 ${
              isDarkMode
                ? "border-amber-600/50 text-amber-200 hover:bg-amber-900/20"
                : "border-amber-300 text-amber-700 hover:bg-amber-100"
            }`}
          >
            <Settings className="h-4 w-4" />
            Google Cloud Console
            <ExternalLink className="h-3 w-3" />
          </Button>

          <Button
            onClick={() =>
              window.open(
                "https://github.com/yourusername/vexo-web/blob/main/backend/GOOGLE_DRIVE_SETUP.md",
                "_blank"
              )
            }
            variant="outline"
            size="sm"
            className={`flex items-center gap-2 ${
              isDarkMode
                ? "border-amber-600/50 text-amber-200 hover:bg-amber-900/20"
                : "border-amber-300 text-amber-700 hover:bg-amber-100"
            }`}
          >
            <ExternalLink className="h-4 w-4" />
            Setup Guide
          </Button>
        </div>

        <div
          className={`text-xs mt-3 p-2 rounded ${
            isDarkMode
              ? "bg-amber-900/20 text-amber-300"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          <strong>Note:</strong> This is a one-time setup. Once configured, all
          Google Drive validation features will work automatically.
        </div>
      </AlertDescription>
    </Alert>
  );
};
