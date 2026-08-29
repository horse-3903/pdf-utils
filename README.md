<div align="center">

# pdf-utils

A fast, private, local-only PDF toolkit for your desktop

![Electron](https://img.shields.io/badge/Electron-191970?style=flat-square&logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Last Commit](https://img.shields.io/badge/Last%20Commit-2026--08-blue?style=flat-square)

</div>

---

## Overview

**pdf-utils** is a desktop clone of the common iLovePDF-style toolset that runs entirely on your machine, no uploads, no accounts, no network calls. Every operation (merging, splitting, watermarking, image conversion, page organization) executes locally using `pdf-lib` and `pdf.js` inside an Electron shell, so files never leave your laptop and the tools stay fast even on large documents.

## Features

- **Merge PDF** - Combine multiple PDFs into one, drag to reorder pages across files
- **Split PDF** - Break a document into parts by custom ranges or a fixed page count
- **Organize PDF** - Reorder, rotate, or delete pages with a drag-and-drop grid
- **Extract Pages** - Select specific pages and pull them into a new document
- **Images to PDF** - Turn a batch of JPG/PNG images into a single PDF
- **PDF to Images** - Export every page as a high-resolution PNG
- **Watermark** - Stamp custom text across every page with adjustable opacity, size, and angle
- **Page Numbers** - Add numbering at the position and starting index you choose
- **Compress PDF** - Rebuild the document and strip metadata to shrink file size

## Tech Stack

![Electron](https://img.shields.io/badge/Electron-191970?style=for-the-badge&logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
npm install
```

### Run locally

```bash
# Web dev server only
npm run dev

# Full desktop app (Electron + hot reload)
npm run electron:dev
```

### Build a Windows installer

```bash
npm run dist:win
```

The installer and icon are configured in `package.json` under `build`; source icon lives at `build/icon.svg` and is rasterized via `npm run` calling `scripts/generate-icons.mjs`.

---

## Project Structure

```
pdf-utils/
├── electron/              # Electron main + preload processes
│   ├── main.ts            # window creation, native save dialogs
│   └── preload.ts         # exposes safe IPC bridge to the renderer
├── build/                 # app icon source + generated .ico/.png
├── scripts/
│   └── generate-icons.mjs # renders build/icon.svg to .ico/.png
├── src/
│   ├── lib/                # pdf-lib + pdf.js engine, file I/O helpers
│   ├── components/          # shared UI kit (dropzone, page grid, buttons)
│   ├── tools/               # one component per PDF tool + tool registry
│   ├── pages/
│   │   └── Home.tsx        # tool picker / landing screen
│   └── App.tsx              # navigation between home and active tool
└── package.json
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_DEV_SERVER_URL` | *(set by Vite)* | Dev server URL the Electron main process loads during `electron:dev` |
