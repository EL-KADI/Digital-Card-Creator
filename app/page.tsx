"use client"

import CardEditor from "./components/card-editor"
import { LanguageProvider } from "@/lib/language-context"
import LanguageSwitcher from "./components/language-switcher"

export default function Home() {
  return (
    <LanguageProvider>
      <main className="container mx-auto py-4 px-4 min-h-screen flex flex-col">
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">
            <span className="text-primary">Digital Card Creator</span>
          </h1>
          <LanguageSwitcher />
        </header>

        <div className="flex-1">
          <CardEditor />
        </div>
      </main>
    </LanguageProvider>
  )
}
