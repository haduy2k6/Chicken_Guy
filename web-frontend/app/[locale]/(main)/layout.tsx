import { notFound } from "next/navigation";
import { routing } from "@/src/i18n/routing";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import Menu from "@/src/features/navigation/components/Menu";
import Footer from "@/src/features/navigation/components/Footer";
import SignInModal from "@/src/features/auth/components/SignInModal.client";
import QueryProvider from "@/src/Tanstackquery/tanstackConfig";
import AuthSyncProvider from "@/src/features/auth/components/AuthSyncProvider.client";


export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <QueryProvider>
        <AuthSyncProvider currentLocale={locale}>
          <Menu />
          {children}
          <SignInModal />
          <Footer />
          </AuthSyncProvider>
      </QueryProvider>
    </NextIntlClientProvider>
  );
}