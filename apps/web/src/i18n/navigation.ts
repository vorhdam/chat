import { createNavigation } from "next-intl/navigation";
import { getLocale } from "./locale";
import { routing } from "./routing";

const {
  Link,
  redirect: navigate,
  usePathname,
  useRouter,
  getPathname,
} = createNavigation(routing);

async function redirect(href: string) {
  const locale = await getLocale();
  return navigate({ href, locale });
}

export { getPathname, Link, navigate, redirect, usePathname, useRouter };
