import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

export const showGoogleDriveSetupToast = () => {
  toast.info("Google Drive Setup Information", {
    description:
      "Google Drive integration requires API authentication. Make sure your backend is configured with Google Drive credentials.",
    icon: <CheckCircle2 className="h-4 w-4" />,
    duration: 3000, // 3 seconds
    action: {
      label: "Learn More",
      onClick: () => {
        // You can add a link to documentation or more details
        console.log("Learn more about Google Drive setup");
      },
    },
  });
};

// Alternative: More detailed toast with custom styling
export const showGoogleDriveSetupToastDetailed = () => {
  toast.custom(
    (t) => (
      <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/50 rounded-lg min-w-[350px]">
        <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium text-blue-900 dark:text-blue-200 mb-1">
            Setup Information
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
            Google Drive integration requires API authentication. Make sure your
            backend is configured with Google Drive credentials.
          </p>
        </div>
        <button
          onClick={() => toast.dismiss(t)}
          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200"
        >
          ×
        </button>
      </div>
    ),
    {
      duration: 3000, // 3 seconds
    }
  );
};

// Alternative: Persistent toast that requires manual dismissal
export const showGoogleDriveSetupToastPersistent = () => {
  toast.info("Google Drive Setup Required", {
    description:
      "Configure your backend with Google Drive API credentials to enable file validation.",
    icon: <CheckCircle2 className="h-4 w-4" />,
    duration: Infinity, // Stays until manually dismissed
    action: {
      label: "Got it",
      onClick: () => toast.dismiss(),
    },
  });
};
