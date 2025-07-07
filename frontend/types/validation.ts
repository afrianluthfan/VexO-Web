export interface ValidationResult {
  filename: string;
  is_valid: boolean;
  validity_score: number;
  percentage: number;
  message: string;
  invalid_reason?: "AI Generated" | "Watermarked";
  file_id?: string;
  drive_url?: string;
}

export interface GoogleDriveResult extends ValidationResult {
  file_id: string;
  drive_url: string;
}
