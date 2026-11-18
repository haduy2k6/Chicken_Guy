import { API_ROUTES } from "@/src/config/routes.config";
import { http } from "@/src/core/httpClient";
import type {
  ConfirmReferralResponse,
  PatientHistoryResponse,
  PatientSubmissionPayload,
  PatientSubmissionResponse,
} from "./types";

export class PatientService {
  public async submitScreeningData(payload: PatientSubmissionPayload): Promise<PatientSubmissionResponse> {
    const formData = new FormData();
    formData.append("specialty", payload.specialty);
    Object.entries(payload.formValues).forEach(([key, val]) => formData.append(key, val));
    payload.files.forEach((file) => formData.append("files", file));

    return http.post<PatientSubmissionResponse>(API_ROUTES.PATIENT.SUBMIT, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  public getHistory(signal?: AbortSignal): Promise<PatientHistoryResponse> {
    return http.get<PatientHistoryResponse>(API_ROUTES.PATIENT.HISTORY, { signal });
  }

  public confirmReferral(caseId: string): Promise<ConfirmReferralResponse> {
    return http.post<ConfirmReferralResponse>(API_ROUTES.PATIENT.CONFIRM_REFERRAL(caseId));
  }
}

export const patientService = new PatientService();
