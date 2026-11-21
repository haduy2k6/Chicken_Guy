"use client";

import { useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import GoogleSignInButton from "./GoogleSignInButton.client";

gsap.registerPlugin(SplitText, useGSAP);

interface Word {
  h: string;
  p: string;
  gg: string;
}

export default function HeroInteractive({ h, p, gg }: Word) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      if (!titleRef.current) return;

      const split = SplitText.create(titleRef.current, {
        type: "chars",
        charsClass: "char",
      });

      gsap.from(split.chars, {
        opacity: 0,
        yPercent: "random(-100, 100)",
        rotation: "random(-60, 60)",
        ease: "back.out",
        stagger: 0.08,
        onComplete: () => {
          split.revert();
        },
      });

      return () => {
        split.revert();
      };
    },
    { scope: titleRef, dependencies: [h] }
  );

  return (
    <div className="relative z-10 w-full max-w-[92dvw] mx-auto text-center space-y-4 sm:space-y-6">
      <h1
        ref={titleRef}
        className="text-3xl sm:text-5xl font-black text-white tracking-tight  drop-shadow-sm"
      >
        {h}
      </h1>
      <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed font-normal drop-shadow-xs">
        {p}
      </p>
      <div className="pt-2 flex justify-center">
        <GoogleSignInButton
          label={gg}
          className="px-6 py-3.5 bg-white hover:bg-stone-50 text-stone-900 rounded-full text-xs sm:text-sm shadow-xl hover:shadow-2xl hover:scale-[1.02]"
        />
      </div>
    </div>
  );
}