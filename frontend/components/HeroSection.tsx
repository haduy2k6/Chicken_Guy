import { useTranslations } from "next-intl";
import HeroInteractive from "./HeroInteractive";

export default function HeroSection() {
  const t = useTranslations("Home.HeroSection1");
  const data1 = {
    h: t("headline"),
    p: t("subheadline"),
    gg: t("signUpGoogle"),
  };

  return (
    <section className="relative w-full md:w-[90dvw] min-h-[92vh] pt-24 top-[10dvh] pb-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center overflow-hidden rounded-3xl m-auto">
      <HeroInteractive {...data1} />

      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      >
        <source src="/videoDesktop.mp4" type="video/mp4" />
        {t("videoNotSupported")}
      </video>

      <div className="absolute inset-0 -z-10 bg-black/30" />
    </section>
  );
}