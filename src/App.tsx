import { useState } from 'react'
import Home from './pages/Home'
import MergeTool from './tools/MergeTool'
import SplitTool from './tools/SplitTool'
import OrganizeTool from './tools/OrganizeTool'
import ExtractTool from './tools/ExtractTool'
import ImagesToPdfTool from './tools/ImagesToPdfTool'
import PdfToImagesTool from './tools/PdfToImagesTool'
import WatermarkTool from './tools/WatermarkTool'
import PageNumbersTool from './tools/PageNumbersTool'
import CompressTool from './tools/CompressTool'

const TOOL_COMPONENTS: Record<string, React.ComponentType<{ onBack: () => void }>> = {
  merge: MergeTool,
  split: SplitTool,
  organize: OrganizeTool,
  extract: ExtractTool,
  'images-to-pdf': ImagesToPdfTool,
  'pdf-to-images': PdfToImagesTool,
  watermark: WatermarkTool,
  'page-numbers': PageNumbersTool,
  compress: CompressTool,
}

function App() {
  const [activeTool, setActiveTool] = useState<string | null>(null)

  const ActiveComponent = activeTool ? TOOL_COMPONENTS[activeTool] : null

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      {ActiveComponent ? (
        <ActiveComponent onBack={() => setActiveTool(null)} />
      ) : (
        <Home onSelect={setActiveTool} />
      )}
    </div>
  )
}

export default App
