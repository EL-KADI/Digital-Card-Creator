"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { translations } from "./translations"

type Language = "en" | "ar"

interface LanguageContextType {
  language: Language
  toggleLanguage: () => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return

    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "ar")) {
      setLanguage(savedLanguage)
    }

    document.documentElement.dir = savedLanguage === "ar" ? "rtl" : "ltr"
    document.documentElement.lang = savedLanguage || "en"
  }, [])

  const toggleLanguage = () => {
    const newLanguage = language === "en" ? "ar" : "en"
    setLanguage(newLanguage)

    if (typeof window !== "undefined") {
      localStorage.setItem("language", newLanguage)
    }

    document.documentElement.dir = newLanguage === "ar" ? "rtl" : "ltr"
    document.documentElement.lang = newLanguage
  }

  const t = (key: string): string => {
    return translations[key]?.[language] || key
  }

  return <LanguageContext.Provider value={{ language, toggleLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
