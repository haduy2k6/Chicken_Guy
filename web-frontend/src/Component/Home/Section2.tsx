import Image from "next/image";
import LotusFlower from "./LotusFlower";
import CarouselCard from "./CarouselCard";
import { useTranslations } from "next-intl";
{/*
  
  hoa sen: z-10
  bup la: -z-10
  cot: <z-20></z-20>
  section2: z-0

  */}
const SLIDES = [
  { key: "slide1", type: "info" },
  { key: "slide2", type: "info" },
  { key: "slide3", type: "stat-danger" },
  { key: "slide4", type: "stat-success" },
];

export default function Section2() {
  const t = useTranslations("Home.Situation");

const slides= SLIDES.map((slide) => ({
  id: slide.key,
  type: slide.type,
  title: t(`slides.${slide.key}.title`),
  desc: t(`slides.${slide.key}.desc`),
  value: slide.type.startsWith("stat") ? t(`slides.${slide.key}.value`) : undefined,
  borderRadius: "1.5rem",
}));
  return (
    <section 
      className="relative w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 flex flex-col justify-center items-center border-2 border-amber-600/80 bg-amber-50/10 backdrop-blur-xs transition-all duration-300 z-0"
      style={{ borderRadius: "51% 49% 73% 27% / 30% 45% 55% 70%" }}
    >
    
      <div className="flex items-center justify-center z-10 shrink-0 -mt-2">
        <LotusFlower isFlipped={false} />
      </div>

      <div className="flex flex-row items-center justify-between gap-1 sm:gap-3 lg:gap-6 w-full my-2 sm:my-4 px-2 sm:px-6">

        <div className="flex-1 min-w-0 flex items-center justify-center relative group">
          <div className="absolute inset-2 bg-linear-to-tr from-rose-400/20 via-amber-300/30 to-pink-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500 -z-10" />
          <Image
            src="/section2L.svg"
            alt="Thực trạng chẩn đoán"
            width={500}
            height={400}
            className="w-full max-w-40 sm:max-w-75 md:max-w-100 h-auto object-contain filter drop-shadow-[0_10px_20px_rgba(244,63,94,0.15)] transition-transform duration-500 group-hover:scale-105"
            loading='lazy'          />
        </div>


        <div className="shrink-0 flex flex-col items-center justify-center z-20 w-3 sm:w-6 h-10 sm:h-16 lg:h-24">
          <div className="w-0.5 sm:w-1 h-full rounded-full bg-linear-to-b from-amber-400 via-rose-400 to-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)] relative flex flex-col justify-between items-center">
            <div className="w-1.5 sm:w-2.5 h-1.5 sm:h-2.5 rounded-full bg-amber-300 border border-rose-500 shadow-xs -mt-1 animate-pulse" />
            <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-rose-400" />
            <div className="w-1.5 sm:w-2.5 h-1.5 sm:h-2.5 rounded-full bg-amber-300 border border-rose-500 shadow-xs -mb-1 animate-pulse" />
          </div>
        </div>

        <div className="flex-[1.2] sm:flex-1 min-w-0 perspective-[1000px] group">
          <div 
            className="w-full
                       transform-[rotateY(-6deg)_rotateX(3deg)] 
                       group-hover:transform-[rotateY(0deg)_rotateX(0deg)_scale(1.02)]
                       "
          >
            <CarouselCard 
              slides={slides} 
              cardClassName="bg-linear-to-br from-white/95 via-amber-50/20 to-rose-50/40 border border-rose-200/50" 
            />
          </div>
        </div>

      </div>

    </section>
  );
}