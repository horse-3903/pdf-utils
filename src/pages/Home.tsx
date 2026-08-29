import { useMemo, useState } from 'react'
import { Search, FileText } from 'lucide-react'
import { TOOLS } from '../tools/registry'

export default function Home({ onSelect }: { onSelect: (id: string) => void }) {
  const [query, setQuery] = useState('')

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = TOOLS.filter(
      (t) => !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    )
    const byGroup: Record<string, typeof TOOLS> = {}
    for (const tool of filtered) {
      byGroup[tool.group] ??= []
      byGroup[tool.group].push(tool)
    }
    return byGroup
  }, [query])

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

        <div className="relative mt-8 w-full max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools…"
            className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
          />
        </div>
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

      {Object.keys(groups).length === 0 && (
        <p className="text-center text-neutral-400">No tools match "{query}"</p>
      )}
    </div>
  )
}
