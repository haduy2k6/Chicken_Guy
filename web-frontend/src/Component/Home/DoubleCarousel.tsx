"use client";

import { useState, useCallback, useMemo } from "react";

export interface SlideData {
  id: string | number;
  title: string;
  desc: string;
  value?: string;
  type?: "info" | "stat-danger" | "stat-success" | string;
}

interface DualCarouselCardProps {
  slides: SlideData[];
  cardClassName?: string;
}

export default function DualCarouselCard({ slides, cardClassName = "" }: DualCarouselCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const totalSlides = slides.length;

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  }, [totalSlides]);

  const handleSelect = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const firstSlide = useMemo(() => slides[activeIndex], [slides, activeIndex]);
  const secondSlide = useMemo(
    () => slides[(activeIndex + 1) % totalSlides],
    [slides, activeIndex, totalSlides]
  );

  return (
    <div className="relative w-full flex items-center gap-3 justify-between mx-auto px-2">
  
      <button
        type="button"
        onClick={handlePrev}
        className="shrink-0 p-2.5 sm:p-3.5 rounded-full bg-white/90 border border-white/80 text-stone-700 hover:bg-[#FF8364] hover:text-white active:scale-95 transition-all shadow-lg backdrop-blur-md z-30 cursor-pointer"
        aria-label="Previous slide"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="m15 19-7-7 7-7" />
        </svg>
      </button>
      <div className="flex-1 flex flex-col gap-4">
        <div className="w-full min-w-[63dvw] flex  gap-4 sm:gap-6 justify-between items-stretch">
          <SingleCardContent slide={firstSlide} cardClassName={cardClassName} isLeft />
          <SingleCardContent slide={secondSlide} cardClassName={cardClassName} isLeft={false} />
        </div>
        <div className="flex items-center justify-center space-x-2 pt-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                activeIndex === idx
                  ? "w-6 bg-[#FF8364]"
                  : "w-2 bg-stone-300 hover:bg-stone-400"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleNext}
        className="shrink-0 p-2.5 sm:p-3.5 rounded-full bg-white/90 border border-white/80 text-stone-700 hover:bg-[#10B981] hover:text-white active:scale-95 transition-all shadow-lg backdrop-blur-md z-30 cursor-pointer"
        aria-label="Next slide"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="m9 5 7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

function SingleCardContent({
  slide,
  cardClassName,
  isLeft,
}: {
  slide?: SlideData;
  cardClassName: string;
  isLeft: boolean;
}) {
  if (!slide) return null;

  const isStat = slide.type?.startsWith("stat");
  const isDanger = slide.type === "stat-danger";

  return (
    <div
      className={`flex-1 relative p-6 rounded-2xl
                 bg-white/80 backdrop-blur-xl border border-white/80
                 shadow-[0_20px_40px_rgba(0,0,0,0.12),0_15px_15px_rgba(255,131,100,0.08)]
                 flex flex-col justify-between min-h-fit max-w-[30dvw] group overflow-hidden ${cardClassName}`}
    >

      <div className="relative w-full flex-1 flex flex-col justify-center z-10">
        {isStat && slide.value && (
          <div
            className={`text-[18px] sm:text-2xl font-extrabold mb-1 tracking-tight ${
              isDanger
                ? "bg-linear-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent"
                : "bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"
            }`}
          >
            {slide.value}
          </div>
        )}

        <h3 className="font-bold text-[14px] sm:text-lg text-stone-800 mb-2 leading-snug group-hover:text-[#FF7052] transition-colors">
          {slide.title}
        </h3>

        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed opacity-90 line-clamp-4">
          {slide.desc}
        </p>
      </div>
    </div>
  );
}