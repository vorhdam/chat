import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";

import Providers from "@/components/providers";
import { routing } from "@/i18n/routing";
import config, { Locale } from "@repo/config";
import "./globals.css";

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
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  if (!routing.locales.includes(typedLocale)) notFound();

  return (
    <html lang={typedLocale}>
      <body
        className={`flex flex-col ${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
