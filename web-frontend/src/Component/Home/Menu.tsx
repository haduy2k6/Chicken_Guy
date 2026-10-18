"use client";

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Switch } from '@heroui/react';
import { userTheme } from '@/src/Store/userThemeStore';
import { userAuth } from '@/src/Store/useAuthStore';
import { authService } from '@/src/Services/auth.service';
import { useRouter, usePathname, Link } from '@/src/i18n/routing';
import { useTransition } from 'react';

export default function Menu() {
  const message = useTranslations("Home.Menu");

  const setSignInPopup = userTheme((state) => state.setSignInPopup);
  const language = userTheme((state) => state.language);
  const setLanguage = userTheme((state) => state.setLanguage);

  const isSignIn = userAuth((state) => state.isSignIn);
  const setSignOut = userAuth((state) => state.setSignOut);

  const isEnglish = language === 'en';
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleChange = (isSelected: boolean) => {
    const newLanguage = isSelected ? "en" : "vi";
    setLanguage(newLanguage);
    startTransition(() => {
      router.replace(pathname, { locale: newLanguage });
    });
  };

  const handleAuthClick = async () => {
    if (isSignIn) {
      await authService.logout();
      if (pathname.includes('/patient') || pathname.includes('/doctor')) {
        router.replace('/');
      }
    } else {
      setSignInPopup(true);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full h-[8dvh] min-h-14 max-h-[8dvh] px-2 sm:px-4 lg:px-[3%] grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-1.5 sm:gap-3 items-center z-50 shadow-[0_4px_20px_-2px_rgba(234,88,12,0.05)] bg-white/70 backdrop-blur-md">
      {/* Logo */}
      <div className="flex justify-start sm:justify-center items-center min-w-0 translate-y-1">
        <Link href="/">
          <Image 
            src="/chicken_Guy.svg" 
            alt="Chicken Guy Group Logo" 
            width={320} 
            height={180} 
            priority
            className="object-contain max-h-[5dvh] sm:max-h-[10dvh] md:max-h-[12dvh] w-auto max-w-full drop-shadow-[0_4px_12px_rgba(234,88,12,0.12)] cursor-pointer"
          />
        </Link>
      </div>

      {/* Menu Links */}
      <ul 
        id="Role" 
        className="flex items-center justify-center justify-self-center gap-2 sm:gap-4 lg:gap-6 px-3 sm:px-5 lg:px-7 py-1.5 sm:py-2 rounded-full 
                   bg-linear-to-r from-white/80 via-orange-50/40 to-white/70 
                   border border-orange-500/15 border-t-white/80 
                   backdrop-blur-xl shadow-[0_8px_20px_rgba(234,88,12,0.06)] 
                   hover:shadow-[0_8px_25px_rgba(234,88,12,0.12)] hover:border-orange-400/30
                   transition-all duration-300 w-auto max-w-full whitespace-nowrap 
                   text-[#3D322C] font-bold text-[10px] xs:text-[12px] sm:text-sm"
      >
        <li className={`transition-colors cursor-pointer ${pathname === '/' ? 'text-orange-600 font-extrabold' : 'hover:text-orange-600'}`}>
          <Link href="/">Home</Link>
        </li>
        <li className={`transition-colors cursor-pointer ${pathname.includes('/patient') ? 'text-orange-600 font-extrabold' : 'hover:text-orange-600'}`}>
          <Link href="/patient">{message('patient')}</Link>
        </li>
        <li className={`transition-colors cursor-pointer ${pathname.includes('/doctor') ? 'text-orange-600 font-extrabold' : 'hover:text-orange-600'}`}>
          <Link href="/doctor">{message('doctor')}</Link>
        </li>
      </ul>

      <div className="min-w-0 flex gap-1 sm:gap-3 lg:gap-4 justify-end items-center justify-self-end">
        <Switch
          aria-label="Set Language"
          size="lg"
          isSelected={isEnglish}
          isDisabled={isPending}
          onChange={handleChange}
          className="scale-75 xs:scale-90 sm:scale-100 origin-right -mr-1 xs:-mr-0.5 sm:mr-0"
        >
          {({ isSelected }) => (
            <Switch.Content>
              <Switch.Control className={isSelected ? 'bg-blue-600' : 'bg-red-600'}>
                <Switch.Thumb className="flex items-center justify-center font-bold text-[10px]">
                  <Switch.Icon>
                    {isSelected ? 'EN' : 'VN'}
                  </Switch.Icon>
                </Switch.Thumb>
              </Switch.Control>
            </Switch.Content>
          )}
        </Switch>

        <button 
          type="button"
          onClick={handleAuthClick}
          className="flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full 
                     bg-linear-to-r from-white/80 via-orange-50/50 to-white/70 
                     border border-orange-500/15 border-t-white/80 
                     backdrop-blur-xl shadow-[0_8px_20px_rgba(234,88,12,0.06)] 
                     hover:shadow-[0_8px_25px_rgba(234,88,12,0.15)] hover:border-orange-400/30 
                     transition-all duration-300 group cursor-pointer"
        >
          <span className="relative flex h-2 sm:h-2.5 w-2 sm:w-2.5 shrink-0">
            {isSignIn && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span 
              className={`relative inline-flex rounded-full h-2 sm:h-2.5 w-2 sm:w-2.5 transition-colors duration-300 ${
                isSignIn 
                  ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' 
                  : 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]'
              }`}
            />
          </span>

          <span className="text-[11px] sm:text-sm font-semibold tracking-wide text-[#3D322C] group-hover:text-orange-600 transition-colors whitespace-nowrap">
            {isSignIn ? message('signOut') : message('signIn')}
          </span>
        </button>
      </div>
    </nav>
  );
}