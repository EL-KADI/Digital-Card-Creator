"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { CardDesign, Template } from "@/lib/types"
import Image from "next/image"
import type { fabric } from "fabric"

interface TemplateSelectorProps {
  templates: Template[]
  savedDesigns: CardDesign[]
  canvas: fabric.Canvas | null
  setCurrentDesign: (design: CardDesign) => void
}

export default function TemplateSelector({ templates, savedDesigns, canvas, setCurrentDesign }: TemplateSelectorProps) {
  const [activeTab, setActiveTab] = useState("templates")

  const handleTemplateSelect = (template: Template) => {
    if (!canvas) return

    // Clear canvas
    canvas.clear()
    canvas.backgroundColor = template.backgroundColor || "#ffffff"

    // Load template
    if (template.json) {
      try {
        canvas.loadFromJSON(template.json, canvas.renderAll.bind(canvas))
      } catch (error) {
        console.error("Error loading template:", error)
      }
    }

    canvas.renderAll()
  }

  const handleSavedDesignSelect = (design: CardDesign) => {
    if (!canvas) return

    try {
      canvas.loadFromJSON(JSON.parse(design.json), canvas.renderAll.bind(canvas))
      setCurrentDesign(design)
    } catch (error) {
      console.error("Error loading saved design:", error)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-4">القوالب والتصاميم</h2>

      <Tabs defaultValue="templates" className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="templates" onClick={() => setActiveTab("templates")}>
            القوالب
          </TabsTrigger>
          <TabsTrigger value="saved" onClick={() => setActiveTab("saved")}>
            المحفوظة
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="flex-1 overflow-y-auto space-y-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="cursor-pointer border rounded-md overflow-hidden hover:border-blue-500 transition-colors"
              onClick={() => handleTemplateSelect(template)}
            >
              <div className="aspect-video relative">
                <Image
                  src={template.thumbnail || "/placeholder.svg"}
                  alt={template.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-2">
                <h3 className="text-sm font-medium">{template.name}</h3>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="saved" className="flex-1 overflow-y-auto space-y-4">
          {savedDesigns.length === 0 ? (
            <p className="text-gray-500 text-center py-4">لا توجد تصاميم محفوظة</p>
          ) : (
            savedDesigns.map((design) => (
              <div
                key={design.id}
                className="cursor-pointer border rounded-md overflow-hidden hover:border-blue-500 transition-colors"
                onClick={() => handleSavedDesignSelect(design)}
              >
                <div className="aspect-video relative">
                  <img
                    src={design.thumbnail || "/placeholder.svg"}
                    alt={design.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2">
                  <h3 className="text-sm font-medium">{design.name}</h3>
                  <p className="text-xs text-gray-500">{new Date(design.createdAt).toLocaleDateString("ar-SA")}</p>
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
