import { API_ROUTES } from "@/src/config/routes.config";
import { http } from "@/src/core/http/httpClient";
import {
  PatientSubmissionPayload,
  PatientSubmissionResponse,
  PatientHistoryItem,
} from "../types";

export class PatientService {
  public async submitScreeningData(
    payload: PatientSubmissionPayload
  ): Promise<PatientSubmissionResponse> {
    const formData = new FormData();

    payload.files.forEach((file) => {
      formData.append("files", file);
    });

    Object.entries(payload.formValues).forEach(([key, val]) => {
      formData.append(key, val);
    });

    return await http.post<PatientSubmissionResponse>(
      API_ROUTES.PATIENT.SUBMIT,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  }

  public async getHistory(): Promise<PatientHistoryItem[]> {
    return await http.get<PatientHistoryItem[]>(API_ROUTES.PATIENT.HISTORY);
  }
}

export const patientService = new PatientService();
