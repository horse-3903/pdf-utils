export {}

declare global {
  interface Window {
    desktop?: {
      isElectron: true
      saveFile: (opts: {
        defaultPath: string
        data: Uint8Array
        filters?: { name: string; extensions: string[] }[]
      }) => Promise<{ canceled: boolean; filePath?: string }>
      saveFiles: (opts: { files: { name: string; data: Uint8Array }[] }) => Promise<{ canceled: boolean; dir?: string }>
      showItemInFolder: (filePath: string) => Promise<void>
    }
  }
}
