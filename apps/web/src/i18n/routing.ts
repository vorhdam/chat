import config from "@repo/config";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: config.i18n.locales,
  defaultLocale: config.i18n.defaultLocale,
});
