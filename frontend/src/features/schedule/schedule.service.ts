import { API_ROUTES } from "@/src/config/routes.config";
import { http } from "@/src/core/httpClient";

export type WorkSession = "morning" | "afternoon";

export interface AvailableDoctor {
  doctorId: string;
  name: string;
  hospital: string | null;
  experienceYears: number;
  bio: string | null;
  sessions: WorkSession[];
}

export interface PublicDoctor {
  id: string;
  name: string;
  degree: string | null;
  hospital: string | null;
  experienceYears: number;
  bio: string | null;
  specialties: { code: string; name: string }[];
}

export interface AvailabilitySlot {
  date: string; // YYYY-MM-DD (giờ VN)
  session: WorkSession;
}

export interface DoctorAppointment {
  id: string;
  scheduledAt: string;
  status: string;
  caseId: string | null;
  patientName: string;
  note: string | null;
}

export const scheduleService = {
  publicDoctors: (): Promise<PublicDoctor[]> => http.get(API_ROUTES.PUBLIC_DOCTORS),

  availableDoctors: (caseId: string, date: string, signal?: AbortSignal): Promise<AvailableDoctor[]> =>
    http.get(API_ROUTES.PATIENT.DOCTORS, { params: { caseId, date }, signal }),

  book: (body: { caseId: string; doctorId: string; date: string; session: WorkSession }) =>
    http.post(API_ROUTES.PATIENT.APPOINTMENTS, body),

  getAvailability: (weekStart: string): Promise<AvailabilitySlot[]> =>
    http.get(API_ROUTES.DOCTOR.AVAILABILITY, { params: { weekStart } }),

  setAvailability: (weekStart: string, slots: AvailabilitySlot[]) =>
    http.put(API_ROUTES.DOCTOR.AVAILABILITY, { weekStart, slots }),

  doctorAppointments: (): Promise<DoctorAppointment[]> => http.get(API_ROUTES.DOCTOR.APPOINTMENTS),
};
