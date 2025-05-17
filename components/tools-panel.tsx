"use client"

import { Button } from "@/components/ui/button"
import { Type, ImageIcon, Square, Circle, Triangle, Trash2, Copy, MoveUp, MoveDown } from "lucide-react"
import { fabric } from "fabric"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ToolsPanelProps {
  canvas: fabric.Canvas | null
}

export default function ToolsPanel({ canvas }: ToolsPanelProps) {
  const addText = () => {
    if (!canvas) return

    const text = new fabric.IText("أدخل النص هنا", {
      left: 100,
      top: 100,
      fontFamily: "Arial",
      fill: "#000000",
      fontSize: 20,
    })

    canvas.add(text)
    canvas.setActiveObject(text)
    canvas.renderAll()
  }

  const addImage = () => {
    if (!canvas) return

    // Create file input
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"

    input.onchange = (e) => {
      const target = e.target as HTMLInputElement
      if (!target.files) return

      const file = target.files[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        const imgObj = new Image()
        imgObj.src = event.target?.result as string

        imgObj.onload = () => {
          const image = new fabric.Image(imgObj)

          // Scale image to fit canvas
          if (image.width && image.height) {
            if (image.width > 300 || image.height > 300) {
              const scaleFactor = Math.min(300 / image.width, 300 / image.height)
              image.scale(scaleFactor)
            }
          }

          canvas.add(image)
          canvas.setActiveObject(image)
          canvas.renderAll()
        }
      }

      reader.readAsDataURL(file)
    }

    input.click()
  }

  const addRectangle = () => {
    if (!canvas) return

    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      fill: "#4CAF50",
      width: 100,
      height: 100,
    })

    canvas.add(rect)
    canvas.setActiveObject(rect)
    canvas.renderAll()
  }

  const addCircle = () => {
    if (!canvas) return

    const circle = new fabric.Circle({
      left: 100,
      top: 100,
      fill: "#2196F3",
      radius: 50,
    })

    canvas.add(circle)
    canvas.setActiveObject(circle)
    canvas.renderAll()
  }

  const addTriangle = () => {
    if (!canvas) return

    const triangle = new fabric.Triangle({
      left: 100,
      top: 100,
      fill: "#FF9800",
      width: 100,
      height: 100,
    })

    canvas.add(triangle)
    canvas.setActiveObject(triangle)
    canvas.renderAll()
  }

  const deleteSelected = () => {
    if (!canvas) return

    const activeObjects = canvas.getActiveObjects()
    if (activeObjects.length > 0) {
      activeObjects.forEach((obj) => {
        canvas.remove(obj)
      })

      canvas.discardActiveObject()
      canvas.renderAll()
    }
  }

  const duplicateSelected = () => {
    if (!canvas) return

    const activeObject = canvas.getActiveObject()
    if (!activeObject) return

    activeObject.clone((cloned: fabric.Object) => {
      canvas.discardActiveObject()

      cloned.set({
        left: (cloned.left || 0) + 20,
        top: (cloned.top || 0) + 20,
        evented: true,
      })

      if (cloned.type === "activeSelection") {
        // @ts-ignore - fabric.js types are not complete
        cloned.canvas = canvas
        // @ts-ignore
        cloned.forEachObject((obj: fabric.Object) => {
          canvas.add(obj)
        })

        // @ts-ignore
        cloned.setCoords()
      } else {
        canvas.add(cloned)
      }

      canvas.setActiveObject(cloned)
      canvas.renderAll()
    })
  }

  const bringForward = () => {
    if (!canvas) return

    const activeObject = canvas.getActiveObject()
    if (activeObject) {
      canvas.bringForward(activeObject)
      canvas.renderAll()
    }
  }

  const sendBackward = () => {
    if (!canvas) return

    const activeObject = canvas.getActiveObject()
    if (activeObject) {
      canvas.sendBackward(activeObject)
      canvas.renderAll()
    }
  }

  return (
    <TooltipProvider>
      <div className="flex items-center justify-center gap-2 h-full">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={addText}>
              <Type className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>إضافة نص</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={addImage}>
              <ImageIcon className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>إضافة صورة</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={addRectangle}>
              <Square className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>إضافة مستطيل</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={addCircle}>
              <Circle className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>إضافة دائرة</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={addTriangle}>
              <Triangle className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>إضافة مثلث</p>
          </TooltipContent>
        </Tooltip>

        <div className="h-8 w-px bg-gray-200 mx-2" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={deleteSelected}>
              <Trash2 className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>حذف</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={duplicateSelected}>
              <Copy className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>نسخ</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={bringForward}>
              <MoveUp className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>نقل للأمام</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={sendBackward}>
              <MoveDown className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>نقل للخلف</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
