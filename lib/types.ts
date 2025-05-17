import type { fabric } from "fabric"

export interface Template {
  id: string
  name: string
  thumbnail: string
  backgroundColor?: string
  json?: string
}

export interface CardDesign {
  id: string
  name: string
  thumbnail: string
  json: string
  createdAt: string
}

export interface SelectedObject {
  type: string
  object: fabric.Object
}
