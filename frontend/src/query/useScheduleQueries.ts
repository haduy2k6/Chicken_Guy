"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import { scheduleService, type AvailabilitySlot } from "@/src/features/schedule/schedule.service";
import { useAuthStore } from "@/src/stores/authStore";

export function usePublicDoctors() {
  return useQuery({ queryKey: queryKeys.doctors.list, queryFn: scheduleService.publicDoctors, staleTime: 10 * 60 * 1000 });
}

// ---- bệnh nhân
export function useAvailableDoctors(caseId: string, date: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.patient.doctors(caseId, date),
    queryFn: ({ signal }) => scheduleService.availableDoctors(caseId, date, signal),
    enabled,
    staleTime: 0,
  });
}

export function useBookAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: scheduleService.book,
    // Làm mới lịch sử (lịch hẹn xuất hiện, hạn mức đổi) và danh sách bác sĩ trống
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.patient.all }),
  });
}

// ---- bác sĩ
function useDoctorId() {
  return useAuthStore((s) => (s.authReady && s.user?.role === "doctor" ? s.user.userId : ""));
}

export function useDoctorAvailability(weekStart: string) {
  const userId = useDoctorId();
  return useQuery({
    queryKey: queryKeys.doctor.availability(userId, weekStart),
    queryFn: () => scheduleService.getAvailability(weekStart),
    enabled: userId !== "",
  });
}

export function useSetAvailability(weekStart: string) {
  const qc = useQueryClient();
  const userId = useDoctorId();
  return useMutation({
    mutationFn: (slots: AvailabilitySlot[]) => scheduleService.setAvailability(weekStart, slots),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.doctor.availability(userId, weekStart) }),
  });
}

export function useDoctorAppointments() {
  const userId = useDoctorId();
  return useQuery({
    queryKey: queryKeys.doctor.appointments(userId),
    queryFn: scheduleService.doctorAppointments,
    enabled: userId !== "",
    staleTime: 60 * 1000,
  });
}
