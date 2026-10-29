import { cn } from "cn";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import React from "react";

import { Footer } from "@/components/blocks/footer";
import { Header } from "@/components/blocks/header";
import Providers from "@/components/providers";
import config from "@repo/config";

import "@/app/globals.css";
import Loading from "@/app/loading";

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
  description: "Simple components for your extraordinary creations.",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme: string =
    (await cookies()).get(config.theme.cookieName)?.value || "";

  return (
    <html lang="en" className={theme}>
      <body
        className={cn(
          "flex flex-col antialiased overflow-x-hidden",
          geistSans.variable,
          geistMono.variable,
        )}
      >
        <React.Suspense fallback={<Loading />}>
          <Providers>
            <Header />
            <main className="flex justify-center items-center min-h-[calc(100vh-8rem)] h-full w-full selection:bg-primary selection:text-primary-foreground">
              {children}
            </main>
            <Footer />
          </Providers>
        </React.Suspense>
      </body>
    </html>
  );
}
