import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import Button from './Button'

export default function ToolShell({
  title,
  subtitle,
  onBack,
  children,
}: {
  title: string
  subtitle?: string
  onBack: () => void
  children: ReactNode
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
        <Button variant="ghost" size="sm" onClick={onBack} className="!px-2">
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">{title}</h1>
          {subtitle && <p className="text-sm text-neutral-500 dark:text-neutral-400">{subtitle}</p>}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">{children}</div>
    </div>
  )
}
