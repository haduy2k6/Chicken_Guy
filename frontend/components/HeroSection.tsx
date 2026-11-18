import { useTranslations } from "next-intl";
import { GoogleSignInButton } from "./GoogleSignInButton.client";
import { HeroInteractiveCarousel } from "./HeroInteractiveCarousel.client";

export default function HeroSection() {
  const t = useTranslations("Home.HeroSection1");

  return (
    <section className="relative w-full md:w-[90dvw] min-h-[92vh] pt-24 pb-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center overflow-hidden bg-linear-to-br from-[#2563eb] via-[#7c3aed] to-[#ec4899] rounded-3xl m-auto">
      <div className="relative z-10 w-full max-w-4xl mx-auto text-center space-y-4 sm:space-y-6">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1] drop-shadow-sm">{t("headline")}</h1>
        <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed font-normal drop-shadow-xs">{t("subheadline")}</p>
        <div className="pt-2 flex justify-center">
          <GoogleSignInButton
            label={t("signUpGoogle")}
            className="px-6 py-3.5 bg-white hover:bg-stone-50 text-stone-900 rounded-full text-xs sm:text-sm shadow-xl hover:shadow-2xl hover:scale-[1.02]"
          />
        </div>
      </div>
      <HeroInteractiveCarousel />
    </section>
  );
}
