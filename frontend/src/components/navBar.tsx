"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, ChevronRight, FlaskRoundIcon as Flask } from "lucide-react"

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <nav className="bg-gradient-to-r from-emerald-700 to-teal-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center space-x-2 text-white font-bold text-xl transition-transform hover:scale-105"
            >
              <Flask className="h-6 w-6" />
              <span>LabFísica</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/dashboard"
              className="text-white hover:text-emerald-200 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-emerald-800/30"
            >
              Dashboard
            </Link>
            <Link
              href="/equipment"
              className="text-white hover:text-emerald-200 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-emerald-800/30"
            >
              Equipos
            </Link>
            <Link
              href="/login"
              className="bg-white text-emerald-700 hover:bg-emerald-100 ml-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 shadow-sm hover:shadow"
            >
              Iniciar sesión
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-emerald-200 hover:bg-emerald-800/30 focus:outline-none transition-colors duration-200"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Abrir menú principal</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isMenuOpen ? "block" : "hidden"}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-emerald-800/90 backdrop-blur-sm">
          <Link
            href="/dashboard"
            className="text-white hover:text-emerald-200 block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 hover:bg-emerald-700/50 flex items-center"
            onClick={() => setIsMenuOpen(false)}
          >
            Dashboard
            <ChevronRight className="ml-auto h-5 w-5" />
          </Link>
          <Link
            href="/equipment"
            className="text-white hover:text-emerald-200 block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 hover:bg-emerald-700/50 flex items-center"
            onClick={() => setIsMenuOpen(false)}
          >
            Equipos
            <ChevronRight className="ml-auto h-5 w-5" />
          </Link>
          <Link
            href="/login"
            className="flex items-center justify-center bg-white text-emerald-700 hover:bg-emerald-100 px-4 py-2 rounded-md text-base font-medium transition-all duration-200 shadow-sm hover:shadow mt-3"
            onClick={() => setIsMenuOpen(false)}
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
