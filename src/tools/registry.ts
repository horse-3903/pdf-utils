import {
  Combine,
  Scissors,
  LayoutGrid,
  FileOutput,
  Image,
  FileImage,
  Stamp,
  Hash,
  Minimize2,
} from 'lucide-react'
import type { ComponentType } from 'react'

export interface ToolDef {
  id: string
  name: string
  description: string
  icon: ComponentType<{ size?: number; className?: string }>
  group: 'Organize' | 'Convert' | 'Edit'
}

export const TOOLS: ToolDef[] = [
  { id: 'merge', name: 'Merge PDF', description: 'Combine multiple PDFs into one document', icon: Combine, group: 'Organize' },
  { id: 'split', name: 'Split PDF', description: 'Break a PDF into separate files by page range', icon: Scissors, group: 'Organize' },
  { id: 'organize', name: 'Organize PDF', description: 'Reorder, rotate, or delete pages', icon: LayoutGrid, group: 'Organize' },
  { id: 'extract', name: 'Extract Pages', description: 'Pull selected pages into a new PDF', icon: FileOutput, group: 'Organize' },
  { id: 'images-to-pdf', name: 'Images to PDF', description: 'Turn JPG or PNG images into a PDF', icon: Image, group: 'Convert' },
  { id: 'pdf-to-images', name: 'PDF to Images', description: 'Export every page as a PNG image', icon: FileImage, group: 'Convert' },
  { id: 'watermark', name: 'Watermark', description: 'Stamp text across every page', icon: Stamp, group: 'Edit' },
  { id: 'page-numbers', name: 'Page Numbers', description: 'Add page numbers to your document', icon: Hash, group: 'Edit' },
  { id: 'compress', name: 'Compress PDF', description: 'Shrink file size by cleaning up metadata', icon: Minimize2, group: 'Edit' },
]
