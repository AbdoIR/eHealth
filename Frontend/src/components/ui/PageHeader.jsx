/**
 * PageHeader
 * Renders a consistent top section for each page.
 *
 * Props:
 *   title        — string | ReactNode — the page/section title
 *   subtitle     — optional descriptive string beneath the title
 *   actionButton — optional ReactNode (e.g. a <button> or <Link>)
 */
export default function PageHeader({ title, subtitle, actionButton }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        )}
      </div>
      {actionButton && (
        <div className="mt-3 sm:mt-0">{actionButton}</div>
      )}
    </div>
  )
}
