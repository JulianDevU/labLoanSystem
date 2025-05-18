"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/src/lib/utils"
import { LayoutDashboard, FileSpreadsheet, Package, Upload } from "lucide-react"

const navItems = [
  {
    title: "Panel de Control",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Préstamos",
    href: "/loans",
    icon: FileSpreadsheet,
    submenu: [
      {
        title: "Préstamos Activos",
        href: "/loans",
      },
      {
        title: "Nuevo Préstamo",
        href: "/loans/new",
      },
      {
        title: "Historial de Préstamos",
        href: "/loans/history",
      },
    ],
  },
  {
    title: "Inventario",
    href: "/inventory",
    icon: Package,
    submenu: [
      {
        title: "Ver Inventario",
        href: "/inventory",
      },
      {
        title: "Agregar Artículo",
        href: "/inventory/new",
      },
    ],
  },
  {
    title: "Importar Datos",
    href: "/import",
    icon: Upload,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="grid gap-1 px-2">
      {navItems.map((item, index) => {
        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)

        return (
          <div key={index} className="mb-2">
            <Link
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                isActive ? "bg-accent" : "transparent",
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.title}</span>
            </Link>

            {isActive && item.submenu && (
              <div className="ml-6 mt-1 grid gap-1">
                {item.submenu.map((subitem, subindex) => (
                  <Link
                    key={subindex}
                    href={subitem.href}
                    className={cn(
                      "block rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                      pathname === subitem.href ? "bg-accent/50" : "transparent",
                    )}
                  >
                    {subitem.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}
