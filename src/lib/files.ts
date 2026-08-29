export async function fileToBytes(file: File): Promise<Uint8Array> {
  const buf = await file.arrayBuffer()
  return new Uint8Array(buf)
}

export function downloadBytes(bytes: Uint8Array, filename: string, mime = 'application/pdf') {
  const desktop = (window as any).desktop
  if (desktop?.isElectron) {
    desktop.saveFile({ defaultPath: filename, data: bytes, filters: mimeToFilters(mime) })
    return
  }
  const blob = new Blob([bytes as BlobPart], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function downloadMultiple(files: { name: string; data: Uint8Array }[]) {
  const desktop = (window as any).desktop
  if (desktop?.isElectron) {
    await desktop.saveFiles({ files })
    return
  }
  for (const f of files) downloadBytes(f.data, f.name)
}

function mimeToFilters(mime: string) {
  if (mime === 'application/pdf') return [{ name: 'PDF', extensions: ['pdf'] }]
  if (mime === 'application/zip') return [{ name: 'ZIP', extensions: ['zip'] }]
  return undefined
}

export function baseName(name: string) {
  return name.replace(/\.[^/.]+$/, '')
}

export function uid() {
  return Math.random().toString(36).slice(2, 10)
}
