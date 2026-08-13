import config, { Locale } from "@repo/config";
import { useLocale as useUnstableLocale } from "next-intl";
import { getLocale as getUnstableLocale } from "next-intl/server";

export async function getLocale(): Promise<Locale> {
  const defaultLocale: Locale = config.i18n.defaultLocale;
  const localeArray: string[] = [...config.i18n.locales];
  const currentLocale: string = await getUnstableLocale();
  if (!localeArray.includes(currentLocale)) return defaultLocale;
  return currentLocale as Locale;
}

export function useLocale(): Locale {
  const defaultLocale: Locale = config.i18n.defaultLocale;
  const localeArray: string[] = [...config.i18n.locales];
  const currentLocale: string = useUnstableLocale();
  if (!localeArray.includes(currentLocale)) return defaultLocale;
  return currentLocale as Locale;
}
