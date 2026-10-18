import { useTranslations } from "next-intl";
import Image from "next/image";
import DualCarouselCard, { SlideData } from "./DoubleCarousel";

const KEYS = ["param1", "param2", "param3", "present"];

export default function Section4() {
  const message = useTranslations("Home.Doctor.Section4");

  const slides: SlideData[] = KEYS.map((key, index) => ({
    id: index,
    title: message(`title.${key}`),
    desc: message(`value.${key}`),
    type: index % 2 === 0 ? "stat-success" : "info",
  }));

  return (
    <section className="flex flex-col items-center justify-center w-full py-12 relative overflow-visible">
      
      {/* Title Badge */}
      <div 
        className="absolute top-[2%] max-w-[40dvw] md:max-w-[20dvw] size-fit mx-auto flex items-center justify-center p-4 sm:p-6
                   bg-linear-to-r from-[#FFFDFB] via-[#FF8364]/15 to-[#10B981]/20 rounded-full border border-white/60 shadow-sm"
      >
        <h2 className="text-xs sm:text-sm md:text-base font-extrabold text-stone-800 tracking-wide text-center drop-shadow-xs">
          {message("actionTitle")}
        </h2>
      </div>

      <div className="w-full relative px-4 flex flex-col items-center gap-8">
        
        <div className="relative z-10 pointer-events-none drop-shadow-2xl">
          <Image
            src="/section4_4.svg"
            width={569}
            height={818}
            alt="Doctor Decoration"
            className="object-contain w-[20vw] min-w-48 max-w-80 h-auto"
            loading='lazy'
          />
        </div>

        <div className="absolute z-20 top-[35%]">
          <DualCarouselCard slides={slides} />
        </div>

      </div>
    </section>
  );
}