"use client";

import { useUiStore } from "@/src/stores/uiStore";
import { useRouter, usePathname } from "@/src/i18n/routing";
import { useTransition } from "react";
import { Switch } from "@heroui/react";

export function SwitchLanguage() {
  const language = useUiStore((state) => state.language);
  const setLanguage = useUiStore((state) => state.setLanguage);
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const isEnglish = language === "en";

  const handleChange = (isSelected: boolean) => {
    const nextLang = isSelected ? "en" : "vi";
    setLanguage(nextLang);
    startTransition(() => {
      router.replace(pathname, { locale: nextLang });
    });
  };

  return (
    <div className="flex items-center">
      <Switch
        aria-label="Toggle Language"
        size="md"
        isSelected={isEnglish}
        isDisabled={isPending}
        onChange={handleChange}
        className="scale-90 sm:scale-100"
      >
        <Switch.Content>
          <Switch.Control className={isEnglish ? "bg-cyan-600" : "bg-red-600"}>
            <Switch.Thumb className="flex items-center justify-center font-bold text-[9px] text-stone-800">
              <Switch.Icon>
                {isEnglish ? "EN" : "VN"}
              </Switch.Icon>
            </Switch.Thumb>
          </Switch.Control>
        </Switch.Content>
      </Switch>
    </div>
  );
}

export default SwitchLanguage;
