import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib'

export async function mergePdfs(files: Uint8Array[]): Promise<Uint8Array> {
  const merged = await PDFDocument.create()
  for (const bytes of files) {
    const src = await PDFDocument.load(bytes)
    const pages = await merged.copyPages(src, src.getPageIndices())
    pages.forEach((p) => merged.addPage(p))
  }
  return merged.save()
}

export async function splitPdf(bytes: Uint8Array, ranges: [number, number][]): Promise<Uint8Array[]> {
  const src = await PDFDocument.load(bytes)
  const results: Uint8Array[] = []
  for (const [start, end] of ranges) {
    const out = await PDFDocument.create()
    const indices = []
    for (let i = start; i <= end; i++) indices.push(i)
    const pages = await out.copyPages(src, indices)
    pages.forEach((p) => out.addPage(p))
    results.push(await out.save())
  }
  return results
}

export async function extractPages(bytes: Uint8Array, indices: number[]): Promise<Uint8Array> {
  const src = await PDFDocument.load(bytes)
  const out = await PDFDocument.create()
  const pages = await out.copyPages(src, indices)
  pages.forEach((p) => out.addPage(p))
  return out.save()
}

export async function removePages(bytes: Uint8Array, indicesToRemove: number[]): Promise<Uint8Array> {
  const src = await PDFDocument.load(bytes)
  const removeSet = new Set(indicesToRemove)
  const keep = src.getPageIndices().filter((i) => !removeSet.has(i))
  const out = await PDFDocument.create()
  const pages = await out.copyPages(src, keep)
  pages.forEach((p) => out.addPage(p))
  return out.save()
}

export async function reorderPages(bytes: Uint8Array, newOrder: number[]): Promise<Uint8Array> {
  const src = await PDFDocument.load(bytes)
  const out = await PDFDocument.create()
  const pages = await out.copyPages(src, newOrder)
  pages.forEach((p) => out.addPage(p))
  return out.save()
}

export type RotationMap = Record<number, number>

export async function rotatePages(bytes: Uint8Array, rotations: RotationMap): Promise<Uint8Array> {
  const src = await PDFDocument.load(bytes)
  const pages = src.getPages()
  for (const [idxStr, angle] of Object.entries(rotations)) {
    const idx = Number(idxStr)
    const page = pages[idx]
    if (!page || !angle) continue
    const current = page.getRotation().angle
    page.setRotation(degrees((current + angle) % 360))
  }
  return src.save()
}

export async function imagesToPdf(images: { data: Uint8Array; type: 'png' | 'jpg' }[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  for (const img of images) {
    const embedded = img.type === 'png' ? await doc.embedPng(img.data) : await doc.embedJpg(img.data)
    const page = doc.addPage([embedded.width, embedded.height])
    page.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height })
  }
  return doc.save()
}

export async function addWatermark(
  bytes: Uint8Array,
  text: string,
  opts: { opacity?: number; fontSize?: number; rotate?: number } = {}
): Promise<Uint8Array> {
  const { opacity = 0.3, fontSize = 48, rotate = 45 } = opts
  const doc = await PDFDocument.load(bytes)
  const font = await doc.embedFont(StandardFonts.HelveticaBold)
  for (const page of doc.getPages()) {
    const { width, height } = page.getSize()
    const textWidth = font.widthOfTextAtSize(text, fontSize)
    page.drawText(text, {
      x: width / 2 - textWidth / 2,
      y: height / 2,
      size: fontSize,
      font,
      color: rgb(0.4, 0.4, 0.45),
      opacity,
      rotate: degrees(rotate),
    })
  }
  return doc.save()
}

export async function addPageNumbers(
  bytes: Uint8Array,
  opts: { position?: 'bottom-center' | 'bottom-right' | 'bottom-left'; startAt?: number; fontSize?: number } = {}
): Promise<Uint8Array> {
  const { position = 'bottom-center', startAt = 1, fontSize = 11 } = opts
  const doc = await PDFDocument.load(bytes)
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const pages = doc.getPages()
  pages.forEach((page, i) => {
    const { width } = page.getSize()
    const label = String(i + startAt)
    const textWidth = font.widthOfTextAtSize(label, fontSize)
    const margin = 28
    let x = width / 2 - textWidth / 2
    if (position === 'bottom-right') x = width - margin - textWidth
    if (position === 'bottom-left') x = margin
    page.drawText(label, { x, y: margin / 1.6, size: fontSize, font, color: rgb(0.2, 0.2, 0.25) })
  })
  return doc.save()
}

export async function buildPdfFromDeck(
  sources: { id: string; bytes: Uint8Array }[],
  pages: { sourceId: string; pageIndex: number; rotation: number }[]
): Promise<Uint8Array> {
  const out = await PDFDocument.create()
  const cache = new Map<string, PDFDocument>()
  for (const p of pages) {
    let src = cache.get(p.sourceId)
    if (!src) {
      src = await PDFDocument.load(sources.find((s) => s.id === p.sourceId)!.bytes)
      cache.set(p.sourceId, src)
    }
    const [copied] = await out.copyPages(src, [p.pageIndex])
    if (p.rotation) {
      const current = copied.getRotation().angle
      copied.setRotation(degrees((current + p.rotation) % 360))
    }
    out.addPage(copied)
  }
  return out.save()
}

export async function compressPdf(bytes: Uint8Array): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes, { updateMetadata: false })
  doc.setTitle('')
  doc.setAuthor('')
  doc.setSubject('')
  doc.setKeywords([])
  doc.setProducer('')
  doc.setCreator('')
  return doc.save({ useObjectStreams: true, addDefaultPage: false })
}
