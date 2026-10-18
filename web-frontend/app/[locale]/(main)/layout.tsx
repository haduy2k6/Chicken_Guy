import { notFound } from "next/navigation";
import { routing } from "@/src/i18n/routing";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import Menu from "@/src/Component/Home/Menu";
import Footer from "@/src/Component/Home/Footer";
import SignIn from "@/src/Component/Home/SignIn";
import QueryProvider from "@/src/Tanstackquery/tanstackConfig";
import AuthSyncProvider from "@/src/Component/Auth/AuthSyncProvider";

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
          <SignIn />
          <Footer />
        </AuthSyncProvider>
      </QueryProvider>
    </NextIntlClientProvider>
  );
}