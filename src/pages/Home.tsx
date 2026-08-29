import { useMemo } from 'react'
import { FileText } from 'lucide-react'
import { TOOLS } from '../tools/registry'

export default function Home({ onSelect }: { onSelect: (id: string) => void }) {
  const groups = useMemo(() => {
    const byGroup: Record<string, typeof TOOLS> = {}
    for (const tool of TOOLS) {
      byGroup[tool.group] ??= []
      byGroup[tool.group].push(tool)
    }
    return byGroup
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-8 py-14">
      <div className="mb-10 flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-white shadow-lg shadow-accent/30">
          <FileText size={28} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">PDF Utils</h1>
        <p className="mt-2 max-w-md text-neutral-500 dark:text-neutral-400">
          Every tool runs on your machine. Nothing is uploaded, nothing leaves your laptop.
        </p>
      </div>

      {Object.entries(groups).map(([group, tools]) => (
        <div key={group} className="mb-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutral-400">{group}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => onSelect(tool.id)}
                className="group flex items-start gap-4 rounded-2xl border border-neutral-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent transition group-hover:bg-accent group-hover:text-white">
                  <tool.icon size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-50">{tool.name}</h3>
                  <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">{tool.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
