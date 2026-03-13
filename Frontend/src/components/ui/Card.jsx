/**
 * Card
 * A clean white surface with a subtle border and shadow.
 *
 * Props:
 *   children   — content
 *   className  — additional tailwind classes for custom sizing / spacing
 *   padding    — whether to apply default inner padding (default: true)
 */
export default function Card({ children, className = '', padding = true }) {
  return (
    <div
      className={`
        bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm
        ${padding ? 'p-5' : ''}
        ${className}
      `.trim()}
    >
      {children}
    </div>
  )
}
