import { useCallback, useRef, useState } from 'react'
import { UploadCloud } from 'lucide-react'
import clsx from 'clsx'

interface Props {
  accept?: string
  multiple?: boolean
  label?: string
  sublabel?: string
  onFiles: (files: File[]) => void
}

export default function Dropzone({ accept, multiple = true, label, sublabel, onFiles }: Props) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return
      onFiles(Array.from(fileList))
    },
    [onFiles]
  )

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        handleFiles(e.dataTransfer.files)
      }}
      onClick={() => inputRef.current?.click()}
      className={clsx(
        'flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-14 text-center cursor-pointer transition-colors',
        dragging
          ? 'border-accent bg-accent/10'
          : 'border-neutral-300 dark:border-neutral-700 hover:border-accent/60 hover:bg-accent/5'
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-accent">
        <UploadCloud size={30} />
      </div>
      <p className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
        {label ?? 'Drop files here or click to browse'}
      </p>
      {sublabel && <p className="text-sm text-neutral-500 dark:text-neutral-400">{sublabel}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}
