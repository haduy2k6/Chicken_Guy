import HeroSection from "@/components/HeroSection";
import OncologySection from "@/components/OncologySection";
import NephrologySection from "@/components/NephrologySection";
import CardiologySection from "@/components/CardiologySection";
import DoctorBoardSection from "@/components/DoctorBoardSection";

export default function Home() {
  return (
    <main className="flex flex-col gap-8 sm:gap-14">
      <HeroSection />

      <OncologySection />

      <NephrologySection />

      <CardiologySection />

      <DoctorBoardSection />
    </main>
  );
}
