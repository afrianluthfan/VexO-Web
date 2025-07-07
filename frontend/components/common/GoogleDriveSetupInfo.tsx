import React from "react";
import { CheckCircle2 } from "lucide-react";

export const GoogleDriveSetupInfo: React.FC = () => {
  return (
    <div className="p-3 sm:p-4 mb-6 sm:mb-8 mx-2 sm:mx-0 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/50 rounded-lg">
      <div className="flex items-start gap-2 sm:gap-3">
        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm sm:text-base">
          <p className="font-medium text-blue-900 dark:text-blue-200">
            Setup Information
          </p>
          <p className="text-blue-700 dark:text-blue-300 mt-1 leading-relaxed">
            Google Drive integration requires API authentication. Make sure your
            backend is configured with Google Drive credentials.
          </p>
        </div>
      </div>
    </div>
  );
};
