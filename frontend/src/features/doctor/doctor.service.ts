import { API_ROUTES } from "@/src/config/routes.config";
import { http } from "@/src/core/httpClient";
import type {
  DoctorCaseDetail,
  DoctorQueueParams,
  DoctorQueueResponse,
  ReviewCaseRequest,
  ReviewCaseResult,
} from "./types";

export class DoctorService {
  public getPatientQueue(params: DoctorQueueParams, signal?: AbortSignal): Promise<DoctorQueueResponse> {
    return http.get<DoctorQueueResponse>(API_ROUTES.DOCTOR.QUEUE, {
      params: {
        ...(params.status !== "all" ? { status: params.status } : {}),
        ...(params.specialty !== "all" ? { specialty: params.specialty } : {}),
      },
      signal,
    });
  }

  public getCaseDetail(caseId: string, signal?: AbortSignal): Promise<DoctorCaseDetail> {
    return http.get<DoctorCaseDetail>(API_ROUTES.DOCTOR.CASE_DETAIL(caseId), { signal });
  }

  public reviewPatientCase(caseId: string, body: ReviewCaseRequest): Promise<ReviewCaseResult> {
    return http.post<ReviewCaseResult>(API_ROUTES.DOCTOR.REVIEW_CASE(caseId), body);
  }
}

export const doctorService = new DoctorService();
