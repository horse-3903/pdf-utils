import clsx from 'clsx'
import type { ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export default function Button({ variant = 'primary', size = 'md', className, ...rest }: Props) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2.5 text-sm',
        size === 'lg' && 'px-6 py-3.5 text-base',
        variant === 'primary' && 'bg-accent text-white shadow-lg shadow-accent/25 hover:bg-accent-dark',
        variant === 'secondary' &&
          'bg-neutral-100 text-neutral-800 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700',
        variant === 'ghost' && 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800',
        variant === 'danger' && 'bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:text-red-400',
        className
      )}
      {...rest}
    />
  )
}
