import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('desktop', {
  saveFile: (opts: { defaultPath: string; data: Uint8Array; filters?: { name: string; extensions: string[] }[] }) =>
    ipcRenderer.invoke('dialog:saveFile', opts),
  saveFiles: (opts: { files: { name: string; data: Uint8Array }[] }) =>
    ipcRenderer.invoke('dialog:saveFiles', opts),
  showItemInFolder: (filePath: string) => ipcRenderer.invoke('shell:showItemInFolder', filePath),
  isElectron: true,
})
