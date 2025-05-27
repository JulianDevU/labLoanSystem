"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { logout } from "../services/authService"
import { getUser } from "../services/userService"
import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"

interface User {
  nombre: string
  correo: string
}

export function UserNav() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const t = useTranslations("UserNav")

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await getUser()
        setUser(result)
      } catch (error) {
        console.error(t("errorFetchingUser"), error)
      }
    }

    fetchUser()
  }, [t])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-user.jpg" alt="@user" />
            <AvatarFallback>
              {user?.nombre?.[0]?.toUpperCase() }
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.nombre}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.correo}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/profile")}>{t("profile")}</DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/settings")}>{t("settings")}</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>{t("logout")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
