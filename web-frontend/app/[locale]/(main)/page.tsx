import Menu from "@/src/Component/Home/Menu";
import Section1 from "@/src/Component/Home/Section1";
import Section2 from "@/src/Component/Home/Section2";
import Section3 from "@/src/Component/Home/Section3";
import Section4 from "@/src/Component/Home/Section4";
import Image from "next/image";
export default function Home() {
  return (
    <main className="flex flex-col gap-1">
        <Section1 />
        <Section2 />
        <div className="w-full flex flex-col items-center mt-6 gap-0">
          <div className="w-full leading-none relative ">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 1440 250" 
              className="w-full h-auto block relative z-2"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chickenGuSmoothGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FF9E7D" />
                  <stop offset="50%" stopColor="#FF8364" />
                  <stop offset="100%" stopColor="#FF7052" />
                </linearGradient>
              </defs>
              <path fill="url(#chickenGuSmoothGrad)" d="M 0,160 
                    C 60,110 120,70 180,120 
                    S 300,240 360,180 
                    S 480,80 540,130 
                    S 660,230 720,160 
                    S 840,90 900,140 
                    S 1020,250 1080,200 
                    S 1200,100 1260,130 
                    S 1380,210 1440,160 
                    L 1440,320 
                    L 0,320 
                    Z">
                  </path>
            </svg>
          <div className="absolute bottom-0 flex items-center justify-center z-1 opacity-20 pointer-events-none right-[5%] sm:right-[12%]">
              <Image
                src="/1a.svg"
                height={350}
                width={450}
                alt="background decoration"
                className="object-contain"
              />
            </div>
          </div>
          <Section3 />
        </div>
        <Section4 />
    </main>
  );
}