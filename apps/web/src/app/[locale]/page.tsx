import { getTranslations } from "next-intl/server";

export default async function HomePage() {
  const t = await getTranslations("Home");
  return <div>{t("helloWorld")}</div>;
}
