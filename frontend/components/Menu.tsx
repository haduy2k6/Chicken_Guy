import Image from "next/image";
import { useTranslations } from "next-intl";
import { APP_ROUTES } from "@/src/config/routes.config";
import { Link } from "@/src/i18n/routing";
import { SwitchLanguage } from "./SwitchLanguage.client";
import { MenuAuthActions } from "./MenuAuthActions.client";
import { MenuMobileOptions } from "./MenuMobileOptions";
import { MenuOptions } from "./MenuOptions";

export interface MultiOptions {
  buttonName: string;
  listOptions: { buttonChild: string; href: string }[];
}

export interface SingleOptions {
  buttonName: string;
  href: string;
}

export type MenuOption = SingleOptions | MultiOptions;

export default function Menu() {
  const t = useTranslations("Home.Menu");
  
  const specialties: MultiOptions = {
    buttonName: t("specialties"),
    listOptions: [
      { buttonChild: t("cancer"), href: APP_ROUTES.SPECIALTIES.ONCOLOGY },
      { buttonChild: t("kidney"), href: APP_ROUTES.SPECIALTIES.NEPHROLOGY },
      { buttonChild: t("cardio"), href: APP_ROUTES.SPECIALTIES.CARDIOLOGY },
    ],
  };

  const doctors: SingleOptions = {
    buttonName: t("doctors"),
    href: APP_ROUTES.DOCTORS,
  };

  const schedule: SingleOptions = {
    buttonName: t("schedule"),
    href: APP_ROUTES.APPOINTMENTS,
  };

  const about: SingleOptions = {
    buttonName: t("about"),
    href: APP_ROUTES.ABOUT,
  };

  const data: MenuOption[] = [specialties, doctors, schedule, about];

  return (
    <header className="fixed top-0 left-0 w-full z-50 h-[8dvh] min-h-14 max-h-16 px-4 sm:px-[5%] flex items-center justify-between bg-white shadow-xs">
      <div className="flex items-center">
        <Link href={APP_ROUTES.HOME} className="flex items-center gap-2">
          <Image
            src="/r.svg"
            alt="Chicken Guy Healthcare"
            width={140}
            height={60}
            priority
            className="h-8 sm:h-9 w-auto object-contain cursor-pointer"
          />
        </Link>
      </div>

      <MenuMobileOptions multi={specialties} single={[doctors, schedule, about]} />
      <MenuOptions data={data} />

      <div className="flex items-center gap-2.5 sm:gap-3.5">
        <SwitchLanguage />
        <MenuAuthActions
          signInLabel={t("signIn")}
          signOutLabel={t("signOut")}
          historyLabel={t("myHistory")}
        />
      </div>
    </header>
  );
}
