export const modalClassNames = {
  backdrop: 'bg-slate-950/45 backdrop-blur-sm',
  base: 'mx-4 my-8',
  closeButton: 'text-slate-500 hover:bg-white/70 dark:text-slate-400 dark:hover:bg-slate-800/80',
}

export const modalSurfaceClass = [
  'modal-surface-fill',
  'overflow-hidden rounded-[28px] border border-clinical-200/70',
  'bg-gradient-to-br from-white via-clinical-50/45 to-slate-100',
  'shadow-[0_24px_80px_-32px_rgba(15,23,42,0.45)]',
  'dark:border-clinical-900/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800',
].join(' ')

export const modalHeaderClass = [
  'border-b border-clinical-100/70 px-6 py-5',
  'bg-gradient-to-r from-clinical-50/90 via-white/95 to-transparent',
  'dark:border-clinical-900/50 dark:from-clinical-950/45 dark:via-slate-900/95 dark:to-transparent',
].join(' ')

export const modalBodyClass = 'bg-white/75 px-6 py-5 dark:bg-slate-900/35'

export const modalFooterClass = [
  'border-t border-clinical-100/70 bg-slate-50/90 px-6 py-4',
  'dark:border-clinical-900/50 dark:bg-slate-950/40',
].join(' ')

export const modalAccentIconClass = [
  'flex h-10 w-10 items-center justify-center rounded-2xl',
  'bg-clinical-100 text-clinical-700 ring-1 ring-clinical-200',
  'dark:bg-clinical-950/50 dark:text-clinical-300 dark:ring-clinical-900/70',
].join(' ')

export const modalSectionClass = [
  'rounded-2xl border border-clinical-100/70 bg-white/80 p-4',
  'dark:border-clinical-900/50 dark:bg-slate-950/30',
].join(' ')

export const modalSecondaryButtonClass = [
  'border border-clinical-200 bg-white/80 text-slate-700',
  'hover:bg-clinical-50 dark:border-clinical-900/60 dark:bg-slate-900/80',
  'dark:text-slate-200 dark:hover:bg-clinical-950/35',
].join(' ')

export const modalPrimaryButtonClass = [
  'bg-clinical-600 text-white shadow-sm shadow-clinical-900/15',
  'hover:bg-clinical-700',
].join(' ')