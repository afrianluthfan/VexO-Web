export interface ValidationResult {
  filename: string;
  is_valid: boolean;
  validity_score: number;
  percentage: number;
  message: string;
  file_id?: string;
  drive_url?: string;
}

export interface GoogleDriveResult extends ValidationResult {
  file_id: string;
  drive_url: string;
}
