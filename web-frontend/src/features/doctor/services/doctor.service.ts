import { API_ROUTES } from "@/src/config/routes.config";
import { http } from "@/src/core/http/httpClient";
import { PatientQueueItem } from "../types";

export class DoctorService {
  public async getPatientQueue(): Promise<PatientQueueItem[]> {
    return await http.get<PatientQueueItem[]>(API_ROUTES.DOCTOR.QUEUE);
  }

  public async reviewPatientCase(
    patientId: string,
    reviewData: { notes: string; status: string }
  ): Promise<{ success: boolean; message: string }> {
    return await http.post<{ success: boolean; message: string }>(
      API_ROUTES.DOCTOR.REVIEW_CASE(patientId),
      reviewData
    );
  }
}

export const doctorService = new DoctorService();
