"use client"

import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import DashboardPage from "./dashboard/page"
import RegisterPage from "./register/page"

export default function Home() {
  const [isChecking, setIsChecking] = useState(true)
  const [hasToken, setHasToken] = useState(false)

  useEffect(() => {
    const token = Cookies.get("token")
    if (token) {
      setHasToken(true)
    }
    setIsChecking(false)
  }, [])

  if (isChecking) return null

  return hasToken ? <DashboardPage /> : <RegisterPage />
}
