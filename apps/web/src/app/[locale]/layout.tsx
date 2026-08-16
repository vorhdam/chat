import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { type ReactNode, Suspense } from "react";

import Providers from "@/components/providers";
import { cn } from "@/components/utils";
import { routing } from "@/i18n/routing";
import config, { type Locale } from "@repo/config";

import "../globals.css";
import Loading from "../loading";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: `%s | ${config.name}`,
    default: config.name,
  },
  description: "This does not matter now.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      {
        url: "/light.ico",
        sizes: "any",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/dark.ico",
        sizes: "any",
        media: "(prefers-color-scheme: light)",
      },
    ],
  },
};

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  if (!routing.locales.includes(typedLocale)) notFound();

  const theme: string =
    (await cookies()).get(config.theme.cookieName)?.value || "";

  return (
    <html lang={typedLocale} className={theme}>
      <body
        className={cn(
          "flex flex-col antialiased overflow-x-hidden",
          geistSans.variable,
          geistMono.variable,
        )}
      >
        <Suspense fallback={<Loading />}>
          <Providers>{children}</Providers>
        </Suspense>
      </body>
    </html>
  );
}
