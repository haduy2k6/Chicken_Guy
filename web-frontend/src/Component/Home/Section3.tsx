import { useTranslations } from "next-intl";

const TITLES = ["title.param1", "title.param2"];
const VALUES = ["value.param1", "value.param2"];

export default function Section3() {
  const t = useTranslations("Home.Patient.Section3");

  return (
    <section
      className="relative flex flex-col items-center justify-center w-full mx-auto
      pt-12 pb-10 px-4 overflow-visible
      bg-linear-to-r from-[#FF9E7D] via-[#FF8364] to-[#FF7052] shadow-xl backdrop-blur-md z-3"
    >
      <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 rounded-full border border-[#FF8364]/40 px-6 py-2 bg-white/95 text-[#D94E34] font-extrabold text-xs sm:text-sm tracking-wide shadow-md backdrop-blur-md flex items-center gap-2 whitespace-nowrap z-10">
        <span className="w-2 h-2 rounded-full bg-[#FF7052] " />
        {t("actionTitle")}
      </div>
      <div className="flex flex-col md:flex-row gap-3 sm:gap-4 w-full max-w-3xl mx-auto">
        <div className="order-2 md:order-1 flex flex-row md:flex-col gap-3 sm:gap-4 md:w-[38%]">
          {TITLES.map((item, index) => (
            <MiniDiv
              key={item}
              title={t(item)}
              value={t(VALUES[index])}
              isHighlighted={index % 2 === 0}
            />
          ))}
        </div>

        <MainDiv
          className="order-1 md:order-2 md:w-[62%]"
          title={t("title.present")}
          value={t("value.present")}
          titleParam={t("title.param3")}
          valueParam={t("value.param3")}
        />
      </div>
      <div className="w-full h-2 relative flex">
          <div className="absolute md:top-0 top-1 left-[2%] aspect-1239/814 min-w-[23%] max-w-[34%] bg-linear-to-r from-[#FF9E7D] via-[#FF8364] to-[#FF7052] "
          style={{
            WebkitMaskImage: "url('/maskSection3cloud.svg')",
            maskImage: "url('/maskSection3cloud.svg')",
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
          }}></div>
           <div className="absolute  md:top-1 top-1.5 right-[4%] aspect-1239/814 rotate-[25%] min-w-[25%] max-w-[34%] bg-linear-to-r from-[#FF9E7D] via-[#FF8364] to-[#FF7052] "
          style={{
            WebkitMaskImage: "url('/maskSection3cloud.svg')",
            maskImage: "url('/maskSection3cloud.svg')",
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
          }}></div>
      </div>
      
      
    </section>
  );
}

interface Data {
  title: string;
  value: string;
  isHighlighted?: boolean;
  compact?: boolean; 
}

function MiniDiv({ title, value, isHighlighted, compact }: Data) {
  return (
    <div
      className={`rounded-2xl border overflow-hidden flex flex-col justify-center items-center text-center
      ${
        compact ? "size-full p-[2.2cqw]" : "flex-1 min-w-0 p-3 sm:p-4"
      } ${
        isHighlighted
          ? "bg-white/90 border-[#FF8364]/40 shadow-md"
          : "bg-white/70 border-[#FF9E7D]/30 shadow-xs"
      }`}
    >
      <Decor />
      <h4
        className={`font-bold text-stone-800 leading-snug mb-1 line-clamp-2 ${
          compact ? "text-[clamp(10px,2.8cqw,16px)]" : "text-xs sm:text-sm md:text-base"
        }`}
      >
        {title}
      </h4>
      <p
        className={`text-stone-600 leading-relaxed ${
          compact
            ? "text-[clamp(9px,2.2cqw,13px)] line-clamp-3"
            : "text-[11px] sm:text-xs md:text-sm line-clamp-4"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

interface MainDivProps {
  title: string;
  value: string;
  titleParam: string;
  valueParam: string;
  className?: string;
}

function MainDiv({ title, value, titleParam, valueParam, className = "" }: MainDivProps) {
  return (
    <div className={`@container relative w-full aspect-1239/1081 ${className}`}>
      <div className="absolute inset-0 drop-shadow-xl">
        <div
          className="size-full bg-white/90 bg-[url('/section3bg.svg')] bg-cover bg-center"
          style={{
            WebkitMaskImage: "url('/mask.svg')",
            maskImage: "url('/mask.svg')",
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
          }}
        />
      </div>

      <div className="absolute right-[3%] top-[2%] max-w-[30%] px-2.5 py-1 rounded-full border border-white/80 bg-white/75 shadow-xs flex items-center gap-1.5 backdrop-blur-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-[#FF7052] animate-pulse" />
        <span className="text-[clamp(8px,1.8cqw,11px)] font-bold text-[#D94E34] uppercase tracking-wider">Tầm Soát Sớm</span>
      </div>
      <div className="absolute left-[3%] top-[4%] max-w-[70%] size-fit p-2 rounded-2xl border-2 border-[#FF8364]/50 bg-white/50 flex items-center">
        <h4 className="font-extrabold text-[#D94E34] leading-tight line-clamp-3 text-[clamp(11px,3.2cqw,28px)]">
          {title}
        </h4>
      </div>
      <div className="absolute right-[4%] bottom-[4%] max-w-[44%] max-h-[54%] size-fit p-2 rounded-xl border-2 border-[#FF8364]/50 bg-white/50 overflow-hidden flex items-center">
        <p className="text-stone-700 leading-relaxed line-clamp-10 text-[clamp(10px,2.3cqw,20px)]">
          {value}
        </p>
      </div>

      <div className="absolute left-[1.5%] bottom-[2%] w-[41%] h-[54%]">
        <MiniDiv title={titleParam} value={valueParam} isHighlighted compact />
      </div>
    </div>
  );
}

 function Decor() {
  const bandeg = [14, 46, 14, 46];
  const sizeBandeg = [26, 12, 27, 12];
  const bubbleSize = [1, 2, 4, 1, 2, 2, 5, 4, 3];

  const bandagePositions = [
    "top-[3%] left-[4%]",
    "top-[4%] right-[6%]",
    "bottom-[5%] left-[8%]",
    "bottom-[6%] right-[7%]",
  ];

  const bubblePositions = [
    { top: "15%", left: "10%" },
    { top: "25%", left: "85%" },
    { top: "45%", left: "20%" },
    { top: "60%", left: "75%" },
    { top: "70%", left: "15%" },
    { top: "80%", left: "90%" },
    { top: "35%", left: "50%" },
    { top: "85%", left: "40%" },
    { top: "10%", left: "70%" },
  ];

  return (
    <div className="w-full h-full absolute inset-0 z-2 pointer-events-none overflow-hidden">
      {bandeg.map((deg, index) => (
        <div
          key={`bandage-${index}`}
          className={`absolute rounded-full bg-white/80 border border-white/40 shadow-sm backdrop-blur-xs ${bandagePositions[index]}`}
          style={{
            width: `${sizeBandeg[index] * 4}px`,
            height: "12px",
            transform: `rotate(${index % 2 === 0 ? deg : -deg}deg)`,
          }}
        >
          <div className="w-full h-full flex items-center justify-evenly opacity-40">
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="w-1 h-1 rounded-full bg-slate-300" />
          </div>
        </div>
      ))}

      {bubbleSize.map((size, index) => (
        <div
          key={`bubble-${index}`}
          className="absolute rounded-full bg-white/60 border border-white/80 "
          style={{
            width: `${size * 6}px`,
            height: `${size * 6}px`,
            top: bubblePositions[index]?.top || "50%",
            left: bubblePositions[index]?.left || "50%",

          }}
        />
      ))}
    </div>
  );
}