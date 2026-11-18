import { DoctorWorkspace } from "@/components/DoctorWorkspace.client";
import RoleGate from "@/components/RoleGate.client";

export default function DoctorPage() {
  return (
    <RoleGate role="doctor"><main className="min-h-screen bg-linear-to-b from-[#FFFDFB] via-[#FFF7F2] to-[#FFF0E8] px-4 pb-16 pt-24 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <DoctorWorkspace />
    </main></RoleGate>
  );
}
