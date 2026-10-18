"use client";

import { useState, useCallback, useMemo } from "react";
import Image from "next/image";

export interface SlideData {
  id: string | number;
  title: string;
  desc: string;
  value?: string;
  type?: "info" | "stat-danger" | "stat-success" | string;
  borderRadius?: string;
}

interface CarouselCardProps {
  slides: SlideData[];
  cardClassName?: string;
}

export default function CarouselCard({ slides, cardClassName = "" }: CarouselCardProps) {
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

  const currentSlide = useMemo(() => slides[activeIndex], [slides, activeIndex]);
  const isStat = currentSlide?.type?.startsWith("stat");
  const isDanger = currentSlide?.type === "stat-danger";

  return (
    <div
      style={{ borderRadius: currentSlide?.borderRadius }}
      className={`relative w-full transition-all duration-500 ease-out p-4 sm:p-6 shadow-xl backdrop-blur-md flex flex-col justify-between min-h-48 sm:min-h-56 ${cardClassName}`}
    >
      <div className="absolute top-0 right-0 w-10 h-10 sm:w-16 sm:h-16 bg-linear-to-bl from-pink-200/20 to-transparent rounded-tr-3xl pointer-events-none" />

      <div className="relative w-full flex-1 flex flex-col justify-center">
        {isStat && currentSlide?.value && (
          <div
            className={`text-base sm:text-3xl lg:text-4xl font-extrabold mb-1 tracking-tight ${
              isDanger
                ? "bg-linear-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent"
                : "bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"
            }`}
          >
            {currentSlide.value}
          </div>
        )}

        <h3 className="text-xs sm:text-base lg:text-lg font-bold text-slate-800 leading-snug mb-1">
          {currentSlide.title}
        </h3>

        <p className="text-[11px] sm:text-xs lg:text-sm text-slate-600 leading-relaxed font-normal line-clamp-3 sm:line-clamp-4">
          {currentSlide.desc}
        </p>
      </div>

      {/* Thanh điều hướng Indicators + Next/Prev */}
      <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-200/50">
        <div className="flex items-center space-x-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(idx)}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                activeIndex === idx
                  ? "w-4 sm:w-6 bg-emerald-600"
                  : "w-1.5 sm:w-2 bg-slate-300 hover:bg-slate-400"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={handlePrev}
            className="p-1 sm:p-2 rounded-full bg-white/80 border border-slate-200 text-slate-700 hover:bg-slate-100 active:scale-95 transition-all shadow-xs"
            aria-label="Previous slide"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="m15 19-7-7 7-7" />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="p-1 sm:p-2 rounded-full bg-white/80 border border-slate-200 text-slate-700 hover:bg-slate-100 active:scale-95 transition-all shadow-xs"
            aria-label="Next slide"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="m9 5 7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}


