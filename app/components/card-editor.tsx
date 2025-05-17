"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Download, ImageIcon, Type, Square, Save, Trash2, RefreshCw, Undo } from "lucide-react"
import { jsPDF } from "jspdf"
import { useLanguage } from "@/lib/language-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const templates = [
  { id: "blank", name: { en: "Blank", ar: "فارغ" }, background: "#ffffff" },
  { id: "birthday", name: { en: "Birthday", ar: "عيد ميلاد" }, background: "#ffebee" },
  { id: "business", name: { en: "Business", ar: "بطاقة عمل" }, background: "#e3f2fd" },
  { id: "invitation", name: { en: "Invitation", ar: "دعوة" }, background: "#f3e5f5" },
]

const fonts = ["Arial", "Times New Roman", "Courier New", "Verdana", "Georgia", "Tajawal"]

const CardEditor = () => {
  const { language, t } = useLanguage()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const fabricCanvasRef = useRef<any>(null)
  const [activeTab, setActiveTab] = useState("text")
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0])
  const [textOptions, setTextOptions] = useState({
    text: language === "ar" ? "أهلاً بك" : "Hello",
    fontSize: 24,
    fontFamily: "Arial",
    color: "#000000",
  })
  const [shapeOptions, setShapeOptions] = useState({
    color: "#1e88e5",
  })
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 400 })
  const [selectedObject, setSelectedObject] = useState<any>(null)
  const [canUndo, setCanUndo] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [fabricLoaded, setFabricLoaded] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return

    let isMounted = true

    // Import fabric only on client side
    const loadFabric = async () => {
      try {
        // استيراد مكتبة fabric بشكل صحيح
        const fabricModule = await import("fabric").catch((err) => {
          console.error("Error importing fabric:", err)
          if (isMounted) setErrorMessage(`Error importing fabric: ${err.message}`)
          return null
        })

        if (!fabricModule || !isMounted) return

        const { fabric } = fabricModule

        if (!fabric || !fabric.Canvas) {
          console.error("fabric.Canvas is undefined")
          if (isMounted) setErrorMessage("fabric.Canvas is undefined")
          return
        }

        if (!canvasRef.current || !canvasContainerRef.current) {
          console.error("Canvas ref or container ref is null")
          if (isMounted) setErrorMessage("Canvas ref or container ref is null")
          return
        }

        setFabricLoaded(true)

        // Initialize canvas
        try {
          const canvas = new fabric.Canvas(canvasRef.current)
          canvas.setWidth(canvasSize.width)
          canvas.setHeight(canvasSize.height)
          canvas.backgroundColor = selectedTemplate.background

          fabricCanvasRef.current = canvas

          // إضافة زر الحذف لكل عنصر
          const addDeleteControl = () => {
            if (!fabric) return

            fabric.Object.prototype.controls.deleteControl = new fabric.Control({
              x: 0.5,
              y: -0.5,
              offsetY: -16,
              offsetX: 16,
              cursorStyle: "pointer",
              mouseUpHandler: deleteObject,
              render: renderDeleteIcon,
            })
          }

          // رسم أيقونة الحذف
          const renderDeleteIcon = (ctx, left, top, styleOverride, fabricObject) => {
            const size = 24
            ctx.save()
            ctx.translate(left, top)
            ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle))
            ctx.beginPath()
            ctx.arc(0, 0, size / 2, 0, 2 * Math.PI)
            ctx.fillStyle = "rgba(255,0,0,0.8)"
            ctx.fill()
            ctx.strokeStyle = "#fff"
            ctx.lineWidth = 2
            ctx.moveTo(-size / 4, -size / 4)
            ctx.lineTo(size / 4, size / 4)
            ctx.moveTo(-size / 4, size / 4)
            ctx.lineTo(size / 4, -size / 4)
            ctx.stroke()
            ctx.restore()
          }

          // حذف العنصر عند النقر على زر الحذف
          const deleteObject = (eventData, transform) => {
            const target = transform.target
            const canvas = target.canvas
            canvas.remove(target)
            canvas.requestRenderAll()
            return true
          }

          // استدعاء الدالة بعد تهيئة الكانفاس
          addDeleteControl()

          // أضف هذا الكود بعد تهيئة الكانفاس وقبل event listeners
          canvas.on("object:added", (e) => {
            if (e.target && e.target.setControlsVisibility) {
              e.target.setControlsVisibility({
                mtr: true, // rotate button
              })
            }
          })

          // تطبيق زر الحذف على جميع العناصر بعد تحميل التصميم
          canvas.on("after:render", () => {
            const objects = canvas.getObjects()
            objects.forEach((obj) => {
              if (obj && obj.setControlsVisibility) {
                obj.setControlsVisibility({
                  mtr: true, // rotate button
                })
              }
            })
          })

          // Set up event listeners
          canvas.on("selection:created", (e) => {
            if (e.selected && e.selected.length > 0) {
              const obj = e.selected[0]
              if (isMounted) setSelectedObject(obj)

              if (obj.type === "rect" || obj.type === "circle" || obj.type === "triangle") {
                if (isMounted)
                  setShapeOptions({
                    color: obj.fill || "#1e88e5",
                  })
              }

              if (obj.type === "i-text" || obj.type === "text") {
                if (isMounted)
                  setTextOptions({
                    text: obj.text || textOptions.text,
                    fontSize: obj.fontSize || textOptions.fontSize,
                    fontFamily: obj.fontFamily || textOptions.fontFamily,
                    color: obj.fill || textOptions.color,
                  })
              }
            }
          })

          canvas.on("selection:updated", (e) => {
            if (e.selected && e.selected.length > 0) {
              const obj = e.selected[0]
              if (isMounted) setSelectedObject(obj)

              if (obj.type === "rect" || obj.type === "circle" || obj.type === "triangle") {
                if (isMounted)
                  setShapeOptions({
                    color: obj.fill || "#1e88e5",
                  })
              }

              if (obj.type === "i-text" || obj.type === "text") {
                if (isMounted)
                  setTextOptions({
                    text: obj.text || textOptions.text,
                    fontSize: obj.fontSize || textOptions.fontSize,
                    fontFamily: obj.fontFamily || textOptions.fontFamily,
                    color: obj.fill || textOptions.color,
                  })
              }
            }
          })

          canvas.on("selection:cleared", () => {
            if (isMounted) setSelectedObject(null)
          })

          // تعديل الكود الذي يتعامل مع تحميل التصميم المحفوظ
          try {
            const savedDesign = localStorage.getItem("cardDesign")
            if (savedDesign) {
              canvas.loadFromJSON(savedDesign, () => {
                // تطبيق زر الحذف على جميع العناصر بعد التحميل
                const objects = canvas.getObjects()
                objects.forEach((obj) => {
                  if (obj && obj.setControlsVisibility) {
                    obj.setControlsVisibility({
                      mtr: true, // rotate button
                    })
                  }
                })
                canvas.renderAll()
                if (isMounted) saveCanvasState()
              })
            } else {
              if (isMounted) saveCanvasState()
            }
          } catch (storageError) {
            console.error("Error accessing localStorage:", storageError)
          }

          // Handle keyboard events
          const handleKeyDown = (e) => {
            if ((e.key === "Delete" || e.key === "Backspace") && canvas.getActiveObject()) {
              deleteSelectedObject()
            } else if (e.ctrlKey || e.metaKey) {
              if (e.key === "z") {
                e.preventDefault()
                handleUndo()
              }
            }
          }

          window.addEventListener("keydown", handleKeyDown)

          // Make canvas responsive
          const resizeCanvas = () => {
            if (!canvasContainerRef.current || !canvas) return

            const containerWidth = canvasContainerRef.current.clientWidth
            const containerHeight = canvasContainerRef.current.clientHeight

            const newWidth = containerWidth
            const newHeight = containerHeight

            canvas.setWidth(newWidth)
            canvas.setHeight(newHeight)
            canvas.renderAll()

            if (isMounted) setCanvasSize({ width: newWidth, height: newHeight })
          }

          resizeCanvas()
          window.addEventListener("resize", resizeCanvas)

          // Track changes for history
          canvas.on("object:modified", saveCanvasState)
          canvas.on("object:added", saveCanvasState)
          canvas.on("object:removed", saveCanvasState)

          // Cleanup
          return () => {
            canvas.dispose()
            fabricCanvasRef.current = null
            window.removeEventListener("keydown", handleKeyDown)
            window.removeEventListener("resize", resizeCanvas)
          }
        } catch (canvasError) {
          console.error("Error creating canvas:", canvasError)
          if (isMounted) setErrorMessage(`Error creating canvas: ${canvasError.message}`)
        }
      } catch (error) {
        console.error("General error:", error)
        if (isMounted) setErrorMessage(`General error: ${error.message}`)
      }
    }

    loadFabric()

    return () => {
      isMounted = false
    }
  }, [])

  // تعديل الكود الذي يتعامل مع تغيير القالب
  // في useEffect الذي يراقب selectedTemplate

  // Update background when template changes
  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.backgroundColor = selectedTemplate.background

      // إذا كان القالب يحتوي على عناصر، تأكد من تطبيق زر الحذف عليها
      if (selectedTemplate.id !== "blank") {
        setTimeout(() => {
          const objects = fabricCanvasRef.current.getObjects()
          objects.forEach((obj) => {
            if (obj && obj.setControlsVisibility) {
              obj.setControlsVisibility({
                mtr: true, // rotate button
              })
            }
          })
          fabricCanvasRef.current.renderAll()
        }, 100)
      }

      fabricCanvasRef.current.renderAll()
      saveCanvasState()
    }
  }, [selectedTemplate])

  const saveCanvasState = () => {
    if (!fabricCanvasRef.current) return

    try {
      const json = JSON.stringify(fabricCanvasRef.current.toJSON())

      if (historyIndex < history.length - 1) {
        setHistory((prev) => prev.slice(0, historyIndex + 1))
      }

      setHistory((prev) => [...prev, json])
      setHistoryIndex((prev) => prev + 1)

      setCanUndo(true)
    } catch (error) {
      console.error("Error saving canvas state:", error)
      setErrorMessage(`Error saving canvas state: ${error.message}`)
    }
  }

  const handleUndo = () => {
    if (!fabricCanvasRef.current || historyIndex <= 0) return

    try {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)

      fabricCanvasRef.current.loadFromJSON(history[newIndex], () => {
        fabricCanvasRef.current?.renderAll()
      })

      setCanUndo(newIndex > 0)
    } catch (error) {
      console.error("Error during undo:", error)
      setErrorMessage(`Error during undo: ${error.message}`)
    }
  }

  const updateSelectedTextProperty = (property, value) => {
    if (!fabricCanvasRef.current) return

    try {
      const activeObject = fabricCanvasRef.current.getActiveObject()
      if (activeObject && (activeObject.type === "i-text" || activeObject.type === "text")) {
        activeObject.set(property, value)
        fabricCanvasRef.current.renderAll()
      }
    } catch (error) {
      console.error(`Error updating text ${property}:`, error)
      setErrorMessage(`Error updating text ${property}: ${error.message}`)
    }
  }

  // تعديل دالة addText لتطبيق زر الحذف على النصوص المضافة
  const addText = async () => {
    if (!fabricCanvasRef.current || !fabricLoaded) return

    try {
      // Import fabric dynamically to ensure it's available
      const fabricModule = await import("fabric")
      const { fabric } = fabricModule

      if (!fabric || !fabric.IText) {
        console.error("fabric.IText is undefined")
        setErrorMessage("fabric.IText is undefined")
        return
      }

      const text = new fabric.IText(textOptions.text, {
        left: canvasSize.width / 2,
        top: canvasSize.height / 2,
        fontFamily: textOptions.fontFamily,
        fontSize: textOptions.fontSize,
        fill: textOptions.color,
        originX: "center",
        originY: "center",
      })

      // تطبيق زر الحذف
      if (text.setControlsVisibility) {
        text.setControlsVisibility({
          mtr: true, // rotate button
        })
      }

      fabricCanvasRef.current.add(text)
      fabricCanvasRef.current.setActiveObject(text)
      fabricCanvasRef.current.renderAll()
    } catch (error) {
      console.error("Error adding text:", error)
      setErrorMessage(`Error adding text: ${error.message}`)
    }
  }

  // تعديل دالة addImage لتطبيق زر الحذف على الصور المضافة
  const addImage = async (e) => {
    if (!fabricCanvasRef.current || !fabricLoaded || !e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    const reader = new FileReader()

    reader.onload = async (event) => {
      if (!event.target?.result || !fabricCanvasRef.current) return

      try {
        const fabricModule = await import("fabric")
        const { fabric } = fabricModule

        if (!fabric || !fabric.Image) {
          console.error("fabric.Image is undefined")
          setErrorMessage("fabric.Image is undefined")
          return
        }

        const imgElement = new Image()
        imgElement.src = event.target.result.toString()

        imgElement.onload = () => {
          try {
            const img = new fabric.Image(imgElement)

            if (img.width && img.height) {
              if (img.width > canvasSize.width / 2) {
                const scaleFactor = canvasSize.width / 2 / img.width
                img.scale(scaleFactor)
              }
            }

            img.set({
              left: canvasSize.width / 2,
              top: canvasSize.height / 2,
              originX: "center",
              originY: "center",
            })

            // تطبيق زر الحذف
            if (img.setControlsVisibility) {
              img.setControlsVisibility({
                mtr: true, // rotate button
              })
            }

            fabricCanvasRef.current.add(img)
            fabricCanvasRef.current.setActiveObject(img)
            fabricCanvasRef.current.renderAll()
          } catch (imgError) {
            console.error("Error creating image:", imgError)
            setErrorMessage(`Error creating image: ${imgError.message}`)
          }
        }

        imgElement.onerror = (imgError) => {
          console.error("Error loading image:", imgError)
          setErrorMessage("Error loading image")
        }
      } catch (error) {
        console.error("Error adding image:", error)
        setErrorMessage(`Error adding image: ${error.message}`)
      }
    }

    reader.onerror = () => {
      console.error("Error reading file")
      setErrorMessage("Error reading file")
    }

    reader.readAsDataURL(file)
  }

  // تعديل دالة addShape لتطبيق زر الحذف على الأشكال المضافة
  const addShape = async (shape) => {
    if (!fabricCanvasRef.current || !fabricLoaded) return

    try {
      const fabricModule = await import("fabric")
      const { fabric } = fabricModule

      if (!fabric) {
        console.error("fabric is undefined")
        setErrorMessage("fabric is undefined")
        return
      }

      let object

      switch (shape) {
        case "rectangle":
          if (!fabric.Rect) {
            console.error("fabric.Rect is undefined")
            setErrorMessage("fabric.Rect is undefined")
            return
          }
          object = new fabric.Rect({
            left: canvasSize.width / 2,
            top: canvasSize.height / 2,
            width: 100,
            height: 100,
            fill: shapeOptions.color,
            originX: "center",
            originY: "center",
          })
          break
        case "circle":
          if (!fabric.Circle) {
            console.error("fabric.Circle is undefined")
            setErrorMessage("fabric.Circle is undefined")
            return
          }
          object = new fabric.Circle({
            left: canvasSize.width / 2,
            top: canvasSize.height / 2,
            radius: 50,
            fill: shapeOptions.color,
            originX: "center",
            originY: "center",
          })
          break
        case "triangle":
          if (!fabric.Triangle) {
            console.error("fabric.Triangle is undefined")
            setErrorMessage("fabric.Triangle is undefined")
            return
          }
          object = new fabric.Triangle({
            left: canvasSize.width / 2,
            top: canvasSize.height / 2,
            width: 100,
            height: 100,
            fill: shapeOptions.color,
            originX: "center",
            originY: "center",
          })
          break
        default:
          return
      }

      // تطبيق زر الحذف
      if (object && object.setControlsVisibility) {
        object.setControlsVisibility({
          mtr: true, // rotate button
        })
      }

      fabricCanvasRef.current.add(object)
      fabricCanvasRef.current.setActiveObject(object)
      fabricCanvasRef.current.renderAll()
    } catch (error) {
      console.error("Error adding shape:", error)
      setErrorMessage(`Error adding shape: ${error.message}`)
    }
  }

  const updateShapeColor = (color) => {
    if (!fabricCanvasRef.current) return

    setShapeOptions({ color })

    try {
      const activeObject = fabricCanvasRef.current.getActiveObject()
      if (
        activeObject &&
        (activeObject.type === "rect" || activeObject.type === "circle" || activeObject.type === "triangle")
      ) {
        activeObject.set("fill", color)
        fabricCanvasRef.current.renderAll()
      }
    } catch (error) {
      console.error("Error updating shape color:", error)
      setErrorMessage(`Error updating shape color: ${error.message}`)
    }
  }

  const deleteSelectedObject = () => {
    if (!fabricCanvasRef.current) return

    try {
      const activeObject = fabricCanvasRef.current.getActiveObject()
      if (activeObject) {
        fabricCanvasRef.current.remove(activeObject)
        fabricCanvasRef.current.renderAll()
      }
    } catch (error) {
      console.error("Error deleting object:", error)
      setErrorMessage(`Error deleting object: ${error.message}`)
    }
  }

  const clearCanvas = () => {
    if (!fabricCanvasRef.current) return

    try {
      fabricCanvasRef.current.clear()
      fabricCanvasRef.current.backgroundColor = selectedTemplate.background
      fabricCanvasRef.current.renderAll()
      setShowClearConfirm(false)
      saveCanvasState()
    } catch (error) {
      console.error("Error clearing canvas:", error)
      setErrorMessage(`Error clearing canvas: ${error.message}`)
    }
  }

  const saveDesign = () => {
    if (!fabricCanvasRef.current) return

    try {
      const json = JSON.stringify(fabricCanvasRef.current.toJSON())
      localStorage.setItem("cardDesign", json)
      alert(t("designSaved"))
    } catch (error) {
      console.error("Error saving design:", error)
      setErrorMessage(`Error saving design: ${error.message}`)
    }
  }

  const downloadAsPNG = () => {
    if (!fabricCanvasRef.current) return

    try {
      const dataURL = fabricCanvasRef.current.toDataURL({
        format: "png",
        quality: 1,
      })

      const link = document.createElement("a")
      link.download = "card-design.png"
      link.href = dataURL
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error downloading as PNG:", error)
      setErrorMessage(`Error downloading as PNG: ${error.message}`)
    }
  }

  const downloadAsPDF = () => {
    if (!fabricCanvasRef.current) return

    try {
      const dataURL = fabricCanvasRef.current.toDataURL({
        format: "png",
        quality: 1,
      })

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvasSize.width, canvasSize.height],
      })

      pdf.addImage(dataURL, "PNG", 0, 0, canvasSize.width, canvasSize.height)
      pdf.save("card-design.pdf")
    } catch (error) {
      console.error("Error downloading as PDF:", error)
      setErrorMessage(`Error downloading as PDF: ${error.message}`)
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full h-full">
      {errorMessage && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <p>{errorMessage}</p>
          <button className="absolute top-0 right-0 p-2" onClick={() => setErrorMessage(null)}>
            ×
          </button>
        </div>
      )}

      <div className="w-full md:w-2/3 h-[70vh]">
        <div className="bg-white p-4 rounded-lg shadow-md h-full">
          <div className="flex justify-end gap-2 mb-2">
            <Button variant="outline" size="icon" onClick={handleUndo} disabled={!canUndo} title={t("undo")}>
              <Undo className="h-4 w-4" />
            </Button>
          </div>
          <div ref={canvasContainerRef} className="border border-gray-200 rounded-lg overflow-hidden h-full w-full">
            <canvas ref={canvasRef} id="canvas" />
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/3">
        <Card className="h-full overflow-auto">
          <CardContent className="pt-6">
            <div className="mb-4 flex justify-between items-center">
              <Label htmlFor="template">{t("selectTemplate")}</Label>
              <Button variant="outline" size="icon" onClick={() => setShowClearConfirm(true)} title={t("clearDesign")}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            <Select
              value={selectedTemplate.id}
              onValueChange={(value) => setSelectedTemplate(templates.find((t) => t.id === value) || templates[0])}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("selectTemplate")} />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {language === "ar" ? template.name.ar : template.name.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="text" className="flex items-center gap-1">
                  <Type className="h-4 w-4" /> {t("text")}
                </TabsTrigger>
                <TabsTrigger value="image" className="flex items-center gap-1">
                  <ImageIcon className="h-4 w-4" /> {t("image")}
                </TabsTrigger>
                <TabsTrigger value="shape" className="flex items-center gap-1">
                  <Square className="h-4 w-4" /> {t("shape")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4">
                <div>
                  <Label htmlFor="text">{t("text")}</Label>
                  <Input
                    id="text"
                    value={textOptions.text}
                    onChange={(e) => {
                      setTextOptions({ ...textOptions, text: e.target.value })
                      updateSelectedTextProperty("text", e.target.value)
                    }}
                    dir={language === "ar" ? "rtl" : "ltr"}
                  />
                </div>

                <div>
                  <Label htmlFor="font-family">{t("font")}</Label>
                  <Select
                    value={textOptions.fontFamily}
                    onValueChange={(value) => {
                      setTextOptions({ ...textOptions, fontFamily: value })
                      updateSelectedTextProperty("fontFamily", value)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectFont")} />
                    </SelectTrigger>
                    <SelectContent>
                      {fonts.map((font) => (
                        <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                          {font}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="font-size">
                    {t("fontSize")}: {textOptions.fontSize}
                  </Label>
                  <Slider
                    id="font-size"
                    min={8}
                    max={200}
                    step={1}
                    value={[textOptions.fontSize]}
                    onValueChange={(value) => {
                      setTextOptions({ ...textOptions, fontSize: value[0] })
                      updateSelectedTextProperty("fontSize", value[0])
                    }}
                    className="my-2"
                  />
                </div>

                <div>
                  <Label htmlFor="color">{t("color")}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      id="color"
                      value={textOptions.color}
                      onChange={(e) => {
                        setTextOptions({ ...textOptions, color: e.target.value })
                        updateSelectedTextProperty("fill", e.target.value)
                      }}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={textOptions.color}
                      onChange={(e) => {
                        setTextOptions({ ...textOptions, color: e.target.value })
                        updateSelectedTextProperty("fill", e.target.value)
                      }}
                      className="flex-1"
                    />
                  </div>
                </div>

                <Button onClick={addText} className="w-full">
                  {t("addText")}
                </Button>
              </TabsContent>

              <TabsContent value="image">
                <div className="space-y-4">
                  <Label htmlFor="image-upload">{t("selectImage")}</Label>
                  <Input id="image-upload" type="file" accept="image/*" onChange={addImage} className="w-full" />
                </div>
              </TabsContent>

              <TabsContent value="shape" className="space-y-4">
                <div>
                  <Label htmlFor="shape-color">{t("color")}</Label>
                  <div className="flex items-center gap-2 mb-4">
                    <Input
                      type="color"
                      id="shape-color"
                      value={shapeOptions.color}
                      onChange={(e) => updateShapeColor(e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={shapeOptions.color}
                      onChange={(e) => updateShapeColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => addShape("rectangle")}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <div className="w-10 h-10 rounded-sm" style={{ backgroundColor: shapeOptions.color }}></div>
                    <span className="mt-1 text-xs">{t("rectangle")}</span>
                  </Button>
                  <Button
                    onClick={() => addShape("circle")}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <div className="w-10 h-10 rounded-full" style={{ backgroundColor: shapeOptions.color }}></div>
                    <span className="mt-1 text-xs">{t("circle")}</span>
                  </Button>
                  <Button
                    onClick={() => addShape("triangle")}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <div
                      className="w-0 h-0 border-x-8 border-x-transparent border-b-[16px]"
                      style={{ borderBottomColor: shapeOptions.color }}
                    ></div>
                    <span className="mt-1 text-xs">{t("triangle")}</span>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 space-y-2">
              <div className="flex gap-2">
                <Button onClick={saveDesign} className="flex-1 flex items-center gap-2">
                  <Save className="h-4 w-4" /> {t("saveDesign")}
                </Button>
                <Button onClick={deleteSelectedObject} variant="destructive" className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" /> {t("delete")}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={downloadAsPNG} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" /> PNG
                </Button>
                <Button onClick={downloadAsPDF} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" /> PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("clearConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("clearConfirmDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={clearCanvas}>{t("confirm")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default CardEditor
