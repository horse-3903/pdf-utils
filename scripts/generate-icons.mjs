import sharp from 'sharp'
import pngToIco from 'png-to-ico'
import fs from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const svgPath = path.join(root, 'build', 'icon.svg')
const svg = await fs.readFile(svgPath)

// Base PNG used by the app window (also used for Linux)
await sharp(svg).resize(512, 512).png().toFile(path.join(root, 'build', 'icon.png'))

// Windows .ico from multiple sizes
const sizes = [16, 24, 32, 48, 64, 128, 256]
const pngBuffers = await Promise.all(
  sizes.map((size) => sharp(svg).resize(size, size).png().toBuffer())
)
const icoBuffer = await pngToIco(pngBuffers)
await fs.writeFile(path.join(root, 'build', 'icon.ico'), icoBuffer)

console.log('Icons generated in build/')
