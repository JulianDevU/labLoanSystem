"use client"

import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import DashboardPage from "@/src/app/[locale]/dashboard/page"
import LoginPage from "@/src/app/[locale]/login/page"

export default function HomeClient() {
  const [isChecking, setIsChecking] = useState(true)
  const [hasToken, setHasToken] = useState(false)

  useEffect(() => {
    const token = Cookies.get("token")
    setHasToken(!!token)
    setIsChecking(false)
  }, [])

  if (isChecking) return null

  return hasToken ? <DashboardPage /> : <LoginPage />
}
