import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

export { pdfjsLib }

export async function renderPageThumbnail(data: Uint8Array, pageIndex: number, maxWidth = 220): Promise<string> {
  const doc = await pdfjsLib.getDocument({ data: data.slice() }).promise
  const page = await doc.getPage(pageIndex + 1)
  const viewport = page.getViewport({ scale: 1 })
  const scale = maxWidth / viewport.width
  const scaledViewport = page.getViewport({ scale })

  const canvas = document.createElement('canvas')
  canvas.width = scaledViewport.width
  canvas.height = scaledViewport.height
  const ctx = canvas.getContext('2d')!

  await page.render({ canvas, canvasContext: ctx, viewport: scaledViewport }).promise
  const url = canvas.toDataURL('image/png')
  doc.destroy()
  return url
}

export async function getPageCount(data: Uint8Array): Promise<number> {
  const doc = await pdfjsLib.getDocument({ data: data.slice() }).promise
  const count = doc.numPages
  doc.destroy()
  return count
}

export async function renderPageToCanvas(
  data: Uint8Array,
  pageIndex: number,
  scale: number
): Promise<HTMLCanvasElement> {
  const doc = await pdfjsLib.getDocument({ data: data.slice() }).promise
  const page = await doc.getPage(pageIndex + 1)
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  const ctx = canvas.getContext('2d')!
  await page.render({ canvas, canvasContext: ctx, viewport }).promise
  doc.destroy()
  return canvas
}
