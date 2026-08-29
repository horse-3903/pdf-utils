import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import path from 'node:path'
import fs from 'node:fs/promises'

const isDev = !app.isPackaged

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#0b0b12',
    show: false,
    autoHideMenuBar: true,
    icon: path.join(process.env.APP_ROOT ?? '', 'build', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  win.once('ready-to-show', () => win.show())

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  return win
}

app.whenReady().then(() => {
  process.env.APP_ROOT = path.join(__dirname, '..')
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('dialog:saveFile', async (_e, opts: { defaultPath: string; data: Uint8Array | Buffer; filters?: { name: string; extensions: string[] }[] }) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    defaultPath: opts.defaultPath,
    filters: opts.filters,
  })
  if (canceled || !filePath) return { canceled: true }
  await fs.writeFile(filePath, Buffer.from(opts.data))
  return { canceled: false, filePath }
})

ipcMain.handle('dialog:saveFiles', async (_e, opts: { defaultDir?: string; files: { name: string; data: Uint8Array | Buffer }[] }) => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory', 'createDirectory'],
    title: 'Choose a folder to save files into',
  })
  if (canceled || !filePaths[0]) return { canceled: true }
  const dir = filePaths[0]
  for (const f of opts.files) {
    await fs.writeFile(path.join(dir, f.name), Buffer.from(f.data))
  }
  return { canceled: false, dir }
})

ipcMain.handle('shell:showItemInFolder', (_e, filePath: string) => {
  shell.showItemInFolder(filePath)
})
