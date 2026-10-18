import { useTranslations } from "next-intl";
import Image from "next/image";
export default function Section1() {
  const message = useTranslations("Home.Preface");

  return (
    <section 
      className="w-full min-h-[calc(100vh-5rem)  bg-cover bg-center bg-no-repeat pt-[4dvh] pb-[3dvh] mt-[8.5dvh] flex items-center justify-between gap-3 sm:gap-8 lg:gap-12 px-4 sm:px-[6%] lg:px-[10%] rounded-md overflow-hidden"
      style={{ backgroundImage: "url('/apm.svg')" }}
    >
      <div className="flex-1 min-w-0 max-w-[55%] sm:max-w-[45%] lg:max-w-[38dvw] flex flex-col items-start justify-center gap-4 sm:gap-6 lg:gap-8 z-10 my-auto">
        
        <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-semibold text-[#1A1A1A] leading-[1.1] tracking-tight">
          {message('s1Left')}
        </h2>

        <p className="text-sm sm:text-base md:text-lg text-[#555555] font-normal max-w-full sm:max-w-[85%] leading-relaxed">
          {message('s1LeftDown')}
        </p>

        <button className="hidden sm:flex items-center gap-3 px-6 py-3.5 rounded-full bg-[#18181B] hover:bg-orange-600 text-white transition-all duration-300 shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] group cursor-pointer">
     
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 group-hover:bg-white/30 text-white text-xs font-bold transition-colors">
            ⊕
          </span>
          <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase">
            {message('checkNow')}
          </span>
        </button>

      </div>

      <div className="flex flex-col items-center justify-end shrink-0 max-w-[45%] sm:max-w-[50%] gap-3 sm:gap-0">
        <Image 
        src="/patientS1.svg"
        alt='sdfa'
        height={1090}
        width = {1250}
        className='object-contain  max-w-[50dvw] w-auto '
        />

        <button className="flex sm:hidden items-center justify-center gap-3 px-5 py-3 rounded-full bg-[#18181B] hover:bg-orange-600 text-white transition-all duration-300 shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] group cursor-pointer">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 group-hover:bg-white/30 text-white text-xs font-bold transition-colors">
            ⊕
          </span>
          <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase">
            {message('checkNow')}
          </span>
        </button>
      </div>
    </section>
  );
}