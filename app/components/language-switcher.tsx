"use client"

import { Button } from "@/components/ui/button"
import { Languages } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export default function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguage()

  return (
    <Button onClick={toggleLanguage} variant="outline" className="flex items-center gap-2">
      <Languages className="h-4 w-4" />
      {language === "ar" ? "English" : "العربية"}
    </Button>
  )
}
