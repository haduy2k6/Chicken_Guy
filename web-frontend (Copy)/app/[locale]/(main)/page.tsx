import HeroSection from "@/src/features/home/components/Section1Hero/HeroSection";
import OncologySection from "@/src/features/specialties/oncology/OncologySection";
import NephrologySection from "@/src/features/specialties/nephrology/NephrologySection";
import CardiologySection from "@/src/features/specialties/cardiology/CardiologySection";
import DoctorBoardSection from "@/src/features/home/components/DoctorBoard/DoctorBoardSection";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-col gap-6 sm:gap-10">
      <HeroSection />

      <OncologySection />

     
        <NephrologySection />


      <CardiologySection />

      <DoctorBoardSection />
    </main>
  );
}