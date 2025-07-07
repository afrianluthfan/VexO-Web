import React from "react";
import { CheckCircle2 } from "lucide-react";

export const GoogleDriveSetupInfo: React.FC = () => {
  return (
    <div className="p-3 mb-8 bg-blue-50 dark:bg-blue-900 border border-blue-200 rounded-lg">
      <div className="flex items-start gap-2">
        <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-100 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-blue-900 dark:text-blue-200">
            Setup Information
          </p>
          <p className="text-blue-700 dark:text-blue-300 mt-1">
            Google Drive integration requires API authentication. Make sure your
            backend is configured with Google Drive credentials.
          </p>
        </div>
      </div>
    </div>
  );
};
