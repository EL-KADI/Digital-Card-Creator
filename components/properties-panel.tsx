"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import type { SelectedObject } from "@/lib/types"
import type { fabric } from "fabric"

interface PropertiesPanelProps {
  canvas: fabric.Canvas | null
  selectedObject: SelectedObject | null
}

export default function PropertiesPanel({ canvas, selectedObject }: PropertiesPanelProps) {
  const [textProps, setTextProps] = useState({
    text: "",
    fontSize: 20,
    fontFamily: "Arial",
    textColor: "#000000",
  })

  const [shapeProps, setShapeProps] = useState({
    fill: "#000000",
    opacity: 100,
    width: 100,
    height: 100,
  })

  useEffect(() => {
    if (!selectedObject) return

    if (selectedObject.type === "i-text" || selectedObject.type === "text") {
      const textObj = selectedObject.object as fabric.IText
      setTextProps({
        text: textObj.text || "",
        fontSize: textObj.fontSize || 20,
        fontFamily: textObj.fontFamily || "Arial",
        textColor: (textObj.fill as string) || "#000000",
      })
    } else if (
      selectedObject.type === "rect" ||
      selectedObject.type === "circle" ||
      selectedObject.type === "triangle"
    ) {
      const shapeObj = selectedObject.object as fabric.Object
      setShapeProps({
        fill: (shapeObj.fill as string) || "#000000",
        opacity: (shapeObj.opacity || 1) * 100,
        width: shapeObj.width || 100,
        height: shapeObj.height || 100,
      })
    }
  }, [selectedObject])

  const updateTextProperty = (property: string, value: any) => {
    if (!canvas || !selectedObject) return

    const obj = selectedObject.object

    // @ts-ignore - fabric.js types are not complete
    obj.set(property, value)
    canvas.renderAll()

    setTextProps((prev) => ({
      ...prev,
      [property]: value,
    }))
  }

  const updateShapeProperty = (property: string, value: any) => {
    if (!canvas || !selectedObject) return

    const obj = selectedObject.object

    // @ts-ignore - fabric.js types are not complete
    obj.set(property, value)
    canvas.renderAll()

    setShapeProps((prev) => ({
      ...prev,
      [property]: value,
    }))
  }

  if (!selectedObject) {
    return (
      <div className="h-full flex flex-col">
        <h2 className="text-lg font-semibold mb-4">خصائص العنصر</h2>
        <p className="text-gray-500 text-center py-4">اختر عنصرًا لتعديل خصائصه</p>
      </div>
    )
  }

  if (selectedObject.type === "i-text" || selectedObject.type === "text") {
    return (
      <div className="h-full flex flex-col">
        <h2 className="text-lg font-semibold mb-4">خصائص النص</h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text">النص</Label>
            <Input id="text" value={textProps.text} onChange={(e) => updateTextProperty("text", e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fontSize">حجم الخط: {textProps.fontSize}px</Label>
            <Slider
              id="fontSize"
              min={8}
              max={72}
              step={1}
              value={[textProps.fontSize]}
              onValueChange={(value) => updateTextProperty("fontSize", value[0])}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fontFamily">نوع الخط</Label>
            <select
              id="fontFamily"
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              value={textProps.fontFamily}
              onChange={(e) => updateTextProperty("fontFamily", e.target.value)}
            >
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="Georgia">Georgia</option>
              <option value="Verdana">Verdana</option>
              <option value="Tahoma">Tahoma</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="textColor">لون النص</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                id="textColor"
                value={textProps.textColor}
                onChange={(e) => updateTextProperty("fill", e.target.value)}
                className="w-12 h-10 p-1"
              />
              <Input
                type="text"
                value={textProps.textColor}
                onChange={(e) => updateTextProperty("fill", e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (selectedObject.type === "rect" || selectedObject.type === "circle" || selectedObject.type === "triangle") {
    return (
      <div className="h-full flex flex-col">
        <h2 className="text-lg font-semibold mb-4">خصائص الشكل</h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fill">لون التعبئة</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                id="fill"
                value={shapeProps.fill}
                onChange={(e) => updateShapeProperty("fill", e.target.value)}
                className="w-12 h-10 p-1"
              />
              <Input
                type="text"
                value={shapeProps.fill}
                onChange={(e) => updateShapeProperty("fill", e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="opacity">الشفافية: {shapeProps.opacity}%</Label>
            <Slider
              id="opacity"
              min={0}
              max={100}
              step={1}
              value={[shapeProps.opacity]}
              onValueChange={(value) => updateShapeProperty("opacity", value[0] / 100)}
            />
          </div>

          {selectedObject.type !== "circle" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="width">العرض: {shapeProps.width}px</Label>
                <Slider
                  id="width"
                  min={10}
                  max={500}
                  step={1}
                  value={[shapeProps.width]}
                  onValueChange={(value) => updateShapeProperty("width", value[0])}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">الارتفاع: {shapeProps.height}px</Label>
                <Slider
                  id="height"
                  min={10}
                  max={500}
                  step={1}
                  value={[shapeProps.height]}
                  onValueChange={(value) => updateShapeProperty("height", value[0])}
                />
              </div>
            </>
          )}

          {selectedObject.type === "circle" && (
            <div className="space-y-2">
              <Label htmlFor="radius">نصف القطر: {shapeProps.width / 2}px</Label>
              <Slider
                id="radius"
                min={5}
                max={250}
                step={1}
                value={[shapeProps.width / 2]}
                onValueChange={(value) => {
                  updateShapeProperty("radius", value[0])
                  setShapeProps((prev) => ({
                    ...prev,
                    width: value[0] * 2,
                    height: value[0] * 2,
                  }))
                }}
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  if (selectedObject.type === "image") {
    return (
      <div className="h-full flex flex-col">
        <h2 className="text-lg font-semibold mb-4">خصائص الصورة</h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="opacity">الشفافية: {shapeProps.opacity}%</Label>
            <Slider
              id="opacity"
              min={0}
              max={100}
              step={1}
              value={[shapeProps.opacity]}
              onValueChange={(value) => updateShapeProperty("opacity", value[0] / 100)}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-4">خصائص العنصر</h2>
      <p className="text-gray-500 text-center py-4">نوع العنصر غير معروف</p>
    </div>
  )
}
