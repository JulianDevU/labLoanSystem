"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/src/lib/utils"
import { LayoutDashboard, FileSpreadsheet, Package, Upload } from "lucide-react"
import { useTranslations } from "next-intl"

export function DashboardNav() {
  const pathname = usePathname()
  const t = useTranslations("DashboardNav")

  const navItems = [
    {
      title: t("dashboard"),
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: t("loans"),
      href: "/loans",
      icon: FileSpreadsheet,
      submenu: [
        {
          title: t("activeLoans"),
          href: "/loans",
        },
        {
          title: t("newLoan"),
          href: "/loans/new",
        },
        {
          title: t("loanHistory"),
          href: "/loans/history",
        },
      ],
    },
    {
      title: t("inventory"),
      href: "/inventory",
      icon: Package,
      submenu: [
        {
          title: t("viewInventory"),
          href: "/inventory",
        },
        {
          title: t("addItem"),
          href: "/inventory/new",
        },
      ],
    },
    {
      title: t("importData"),
      href: "/import",
      icon: Upload,
    },
  ]

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
