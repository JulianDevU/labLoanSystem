import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./useAuth"

export function useRequireAuth() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, loading, router])
}
