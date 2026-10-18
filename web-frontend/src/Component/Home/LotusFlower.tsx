"use client";

import { useTranslations } from "next-intl";

const TRUST_KEYS = ["accuracy", "doctor", "time", "turnaround", "security"];

const PETALS_CONFIG = [
  {
    key: "wing_left",
    borderRadius: "0% 100% 40% 60% / 28% 100% 0% 72%",
    position: "bottom-1 left-[15%]",
    rotate: -42,
    zIndex: 1,
    size: "w-20 h-20 sm:w-24 sm:h-24",
    bgGradient: "bg-gradient-to-br from-rose-300 via-pink-400 to-amber-300",
    border: "border-pink-300/60",
    hasContent: false,
    align: "justify-center p-2",
  },
  {
    key: "wing_right",
    borderRadius: "100% 0% 45% 55% / 100% 28% 72% 0%",
    position: "bottom-1 right-[15%]",
    rotate: 42,
    zIndex: 1,
    size: "w-20 h-20 sm:w-24 sm:h-24",
    bgGradient: "bg-gradient-to-bl from-rose-300 via-pink-400 to-amber-300",
    border: "border-pink-300/60",
    hasContent: false,
    align: "justify-center p-2",
  },
  {
    key: TRUST_KEYS[0],
    borderRadius: "37% 63% 43% 57% / 0% 100% 0% 100%",
    position: "bottom-7 left-[21%]",
    rotate: -6,
    zIndex: 10,
    size: "w-20 h-20 sm:w-24 sm:h-24",
    bgGradient: "bg-gradient-to-br from-amber-100 via-orange-200 to-rose-300",
    border: "border-amber-300/80",
    hasContent: true,
    align: "items-end justify-center pr-2",
  },
  {
    key: TRUST_KEYS[1],
    borderRadius: "55% 45% 45% 55% / 100% 0% 100% 0%",
    position: "bottom-7 right-[21%]",
    rotate: 6,
    zIndex: 10,
    size: "w-20 h-20 sm:w-24 sm:h-24",
    bgGradient: "bg-gradient-to-bl from-amber-100 via-orange-200 to-rose-300",
    border: "border-amber-300/80",
    hasContent: true,
    align: "items-start justify-center pl-2",
  },
  {
    key: 'wring-center', 
    borderRadius: "55% 45% 45% 55% / 100% 0% 100% 0%",
    position: "bottom-18 sm:bottom-22 right-[17%] -translate-x-1/2",
    rotate: -30,
    zIndex: 5,
    size: "w-15 h-15 sm:w-17 sm:h-17",
    bgGradient: "bg-gradient-to-tr from-amber-200 via-yellow-300 to-orange-300",
    border: "border-amber-400/80",
    hasContent: false,
    align: "justify-start pt-3 translate-y-[-0.5rem]",
  },
];

interface LotusFlowerProps {
  isFlipped?: boolean;
}

export default function LotusFlower({ isFlipped = false }: LotusFlowerProps) {
  const message = useTranslations("Home.Trust");

  return (
    <div 
      className={`relative w-64 h-36 sm:w-72 sm:h-44 flex justify-center items-end scale-90 sm:scale-100 transition-transform duration-300 z-10 ${
        isFlipped ? "rotate-180" : ""
      }`}
      style={{
        filter: "drop-shadow(0px 4px 12px rgba(253, 224, 71, 0.35))"
      }}
    >
      {PETALS_CONFIG.map((petal) => (
        <div
          key={petal.key}
          className={`absolute ${petal.size} 
                     flex flex-col items-center text-center
                     ${petal.bgGradient} border ${petal.border}
                     shadow-sm transition-all duration-300 
                     ${petal.position} ${petal.align}`}
          style={{
            borderRadius: petal.borderRadius,
            zIndex: petal.zIndex,
            transform: `rotate(${petal.rotate}deg)${
              petal.position.includes("-translate-x-1/2") ? " translateX(-50%)" : ""
            }`,
          }}
        >
          {petal.hasContent && (
            <div
              className={`flex flex-col items-center justify-center w-full h-full ${
                isFlipped ? "rotate-180" : ""
              }`}
              style={{ transform: `rotate(${-petal.rotate + (isFlipped ? 180 : 0)}deg)` }}
            >
              <h4 className="text-[9.5px] sm:text-[10.5px] font-semibold leading-snug text-amber-950/90 line-clamp-2 drop-shadow-sm tracking-wide">
                {message(`${petal.key}.title`)}
              </h4>
              <p className="text-[11px] sm:text-xs font-extrabold leading-tight text-amber-950 mt-0.5 drop-shadow-sm">
                {message(`${petal.key}.value`)}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}