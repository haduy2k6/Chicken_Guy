export interface PatientSubmissionPayload {
  files: File[];
  formValues: Record<string, string>;
}

export interface PatientSubmissionResponse {
  success: boolean;
  message: string;
  profileId?: string;
  diagnosisId?: string;
  uploadedImagesCount?: number;
}

export interface PatientHistoryItem {
  id: string;
  submissionDate: string;
  status: string;
  diagnosisNotes?: string;
}
