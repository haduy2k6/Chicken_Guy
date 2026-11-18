import HeroSection from "@/components/HeroSection";
import OncologySection from "@/components/OncologySection";
import DoctorBoardSection from "@/components/DoctorBoardSection";

export default function Home() {
  return (
    <main className="flex flex-col gap-6 sm:gap-10">
      <HeroSection />

      <OncologySection />

      <DoctorBoardSection />
    </main>
  );
}
