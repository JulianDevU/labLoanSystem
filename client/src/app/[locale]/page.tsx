// src/app/[locale]/page.tsx
import HomeClient from "@/src/components/home-client"
import { getTranslations } from "next-intl/server"

export default async function Home() {
  const t = await getTranslations("Login")
  
  return <HomeClient translations={{ title: t("title") }} />
}
