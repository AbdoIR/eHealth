import React, { forwardRef } from 'react'

function joinClasses(...classes) {
  return classes.filter(Boolean).join(' ')
}

export const decoratedInputClasses = {
  base: joinClasses(
    'w-full',
    'rounded-xl',
    'border-[1.5px]',
    'border-violet-500',
    'bg-slate-50',
    'dark:bg-slate-900',
    'text-sm',
    'text-slate-700',
    'dark:text-slate-100',
    'placeholder:text-slate-400',
    'dark:placeholder:text-slate-500',
    'shadow-[0_1px_2px_rgba(0,0,0,0.05)]',
    'outline-none',
    'transition-all',
    'duration-150',
    'focus:border-violet-600',
    'focus:ring-4',
    'focus:ring-violet-500/15',
    'dark:border-slate-700',
    'dark:focus:border-violet-500',
    'disabled:cursor-not-allowed',
    'disabled:opacity-60',
    '[color-scheme:light]',
    'dark:[color-scheme:dark]',
  ),
  input: 'h-11 px-4',
  textarea: 'min-h-11 px-4 py-3 leading-6 resize-y',
  withStartAdornment: 'pl-11',
}

export const decoratedSelectClassNames = {
  trigger: joinClasses(
    'h-11 rounded-xl border-[1.5px] border-violet-500 bg-slate-50 px-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all',
    'hover:border-slate-300',
    'data-[open=true]:border-clinical-500 data-[focus=true]:border-clinical-500',
    'data-[open=true]:ring-4 data-[focus=true]:ring-4 ring-clinical-500/15',
    'dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600',
  ),
  value: 'text-sm text-slate-700 data-[has-value=true]:text-slate-700 dark:text-slate-100 dark:data-[has-value=true]:text-slate-100',
  selectorIcon: 'text-slate-400 dark:text-slate-500',
  popoverContent: joinClasses(
    'rounded-2xl border border-slate-200 bg-white/95 p-1 shadow-xl backdrop-blur-sm',
    'dark:border-slate-700 dark:bg-slate-900/95',
  ),
  listboxWrapper: 'max-h-72 p-0',
  listbox: 'gap-1 p-1',
}

export const CustomInput = forwardRef(function CustomInput(
  {
    as = 'input',
    className = '',
    containerClassName = '',
    startAdornment,
    rows,
    ...props
  },
  ref,
) {
  const Component = as
  const isTextarea = Component === 'textarea'

  return (
    <div className={joinClasses('relative', containerClassName)}>
      {startAdornment && (
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {startAdornment}
        </span>
      )}

      <Component
        {...props}
        ref={ref}
        rows={isTextarea ? rows : undefined}
        className={joinClasses(
          decoratedInputClasses.base,
          isTextarea ? decoratedInputClasses.textarea : decoratedInputClasses.input,
          startAdornment && decoratedInputClasses.withStartAdornment,
          className,
        )}
      />
    </div>
  )
})

export const CustomTextarea = forwardRef(function CustomTextarea(props, ref) {
  return <CustomInput {...props} ref={ref} as="textarea" />
})

export default CustomInput
