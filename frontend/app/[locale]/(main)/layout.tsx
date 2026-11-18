import { notFound } from "next/navigation";
import { routing } from "@/src/i18n/routing";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import Menu from "@/components/Menu";
import Footer from "@/components/Footer";
import SignInModal from "@/components/SignInModal.client";
import QueryProvider from "@/src/query/queryProvider";
import AuthSyncProvider from "@/components/AuthSyncProvider.client";


export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

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
