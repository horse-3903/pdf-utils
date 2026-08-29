import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { RotateCw, Trash2, Check } from 'lucide-react'
import clsx from 'clsx'

export interface GridPage {
  id: string
  thumbnail: string | null
  label: string
  rotation: number
  selected: boolean
}

interface Props {
  pages: GridPage[]
  onReorder: (pages: GridPage[]) => void
  onToggleSelect?: (id: string) => void
  onRotate?: (id: string) => void
  onDelete?: (id: string) => void
  selectable?: boolean
}

export default function PageGrid({ pages, onReorder, onToggleSelect, onRotate, onDelete, selectable }: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = pages.findIndex((p) => p.id === active.id)
    const newIndex = pages.findIndex((p) => p.id === over.id)
    onReorder(arrayMove(pages, oldIndex, newIndex))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={pages.map((p) => p.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {pages.map((page) => (
            <SortablePage
              key={page.id}
              page={page}
              selectable={selectable}
              onToggleSelect={onToggleSelect}
              onRotate={onRotate}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

function SortablePage({
  page,
  selectable,
  onToggleSelect,
  onRotate,
  onDelete,
}: {
  page: GridPage
  selectable?: boolean
  onToggleSelect?: (id: string) => void
  onRotate?: (id: string) => void
  onDelete?: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: page.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={clsx(
        'group relative select-none rounded-xl border bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing',
        page.selected ? 'border-accent ring-2 ring-accent/40' : 'border-neutral-200 dark:border-neutral-800',
        isDragging && 'opacity-50 z-10'
      )}
    >
      <div
        className="aspect-[3/4] w-full overflow-hidden rounded-t-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center"
        onClick={(e) => {
          if (selectable) {
            e.stopPropagation()
            onToggleSelect?.(page.id)
          }
        }}
      >
        {page.thumbnail ? (
          <img
            src={page.thumbnail}
            alt={page.label}
            draggable={false}
            style={{ transform: `rotate(${page.rotation}deg)` }}
            className="max-h-full max-w-full object-contain transition-transform"
          />
        ) : (
          <div className="h-8 w-8 animate-pulse rounded bg-neutral-300 dark:bg-neutral-700" />
        )}
      </div>

      <div className="flex items-center justify-between px-2 py-1.5">
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{page.label}</span>
        <div className="flex items-center gap-1">
          {onRotate && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                onRotate(page.id)
              }}
              className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              <RotateCw size={14} />
            </button>
          )}
          {onDelete && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                onDelete(page.id)
              }}
              className="rounded-md p-1 text-neutral-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {selectable && (
        <div
          className={clsx(
            'absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full border-2 bg-white/90 dark:bg-neutral-900/90',
            page.selected ? 'border-accent bg-accent text-white' : 'border-neutral-300 dark:border-neutral-600'
          )}
        >
          {page.selected && <Check size={12} />}
        </div>
      )}
    </div>
  )
}
