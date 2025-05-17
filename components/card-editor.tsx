"use client"

import { useEffect, useRef } from "react"
import type { CardDesign, SelectedObject } from "@/lib/types"
import * as fabric from "fabric" 

interface CardEditorProps {
  setCanvas: (canvas: fabric.fabric.Canvas) => void
  canvas: fabric.fabric.Canvas | null
  setSelectedObject: (obj: SelectedObject | null) => void
  currentDesign: CardDesign | null
}

export default function CardEditor({ setCanvas, canvas, setSelectedObject, currentDesign }: CardEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    
    import("fabric")
      .then((mod) => {
        const fabric = mod 
        console.log("fabric loaded:", fabric)
        console.log("fabric.Canvas:", fabric.fabric.Canvas) 

        if (!fabric.fabric.Canvas) {
          throw new Error("fabric.Canvas is undefined")
        }

      
        const fabricCanvas = new fabric.fabric.Canvas(canvasRef.current, {
          width: 800,
          height: 500,
          backgroundColor: "#ffffff",
        })

        setCanvas(fabricCanvas)

        
        fabricCanvas.on("selection:created", (e: any) => {
          if (e.selected && e.selected.length > 0) {
            const obj = e.selected[0]
            setSelectedObject({
              type: obj.type || "unknown",
              object: obj,
            })
          }
        })

        fabricCanvas.on("selection:updated", (e: any) => {
          if (e.selected && e.selected.length > 0) {
            const obj = e.selected[0]
            setSelectedObject({
              type: obj.type || "unknown",
              object: obj,
            })
          }
        })

        fabricCanvas.on("selection:cleared", () => {
          setSelectedObject(null)
        })

        return () => {
          fabricCanvas.dispose()
        }
      })
      .catch((error) => {
        console.error("خطأ في تحميل fabric:", error)
      })
  }, [setCanvas, setSelectedObject])

  
  useEffect(() => {
    if (!canvas || !currentDesign) return

    try {
      canvas.loadFromJSON(JSON.parse(currentDesign.json), () => {
        canvas.renderAll()
      })
    } catch (error) {
      console.error("خطأ في تحميل التصميم:", error)
    }
  }, [canvas, currentDesign])


  useEffect(() => {
    if (!canvas || !canvasContainerRef.current) return

    const resizeCanvas = () => {
      if (!canvasContainerRef.current || !canvas) return

      const containerWidth = canvasContainerRef.current.clientWidth
      const containerHeight = canvasContainerRef.current.clientHeight

  
      const ratio = 16 / 10
      let newWidth = containerWidth - 40
      let newHeight = newWidth / ratio

      if (newHeight > containerHeight - 40) {
        newHeight = containerHeight - 40
        newWidth = newHeight * ratio
      }

      canvas.setDimensions({
        width: newWidth,
        height: newHeight,
      })

      canvas.setZoom(newWidth / 800)
      canvas.renderAll()
    }

    window.addEventListener("resize", resizeCanvas)
    resizeCanvas()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [canvas])

  return (
    <div
      ref={canvasContainerRef}
      className="w-full h-full flex items-center justify-center bg-white shadow-lg rounded-lg overflow-hidden"
    >
      <canvas ref={canvasRef} />
    </div>
  )
}