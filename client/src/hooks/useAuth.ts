import { useEffect, useState } from "react"
import Cookies from "js-cookie"

export function useAuth() {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true) // nuevo estado

  useEffect(() => {
    const savedToken = Cookies.get("token")
    if (savedToken) {
      setToken(savedToken)
    }
    setLoading(false) // ya terminó de cargar
  }, [])

  const isAuthenticated = !!token

  return { token, isAuthenticated, loading }
}
