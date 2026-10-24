import { type Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { cookies } from "next/headers";
import * as React from "react";

import Providers from "@/components/providers";
import config from "@repo/config";
import { cn } from "cn";

import "@/app/globals.css";
import Loading from "@/app/loading";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

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
    template: `%s | ${config.name}/ui`,
    default: `${config.name}/ui`,
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
    <html lang="en" className={cn(theme, "font-sans", inter.variable)}>
      <body
        className={cn(
          "flex flex-col antialiased overflow-x-hidden",
          geistSans.variable,
          geistMono.variable,
        )}
      >
        <React.Suspense fallback={<Loading />}>
          <Providers>{children}</Providers>
        </React.Suspense>
      </body>
    </html>
  );
}
