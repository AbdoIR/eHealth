/**
 * VisitTimeline.jsx
 * Pure UI — renders an ordered list of VisitCard components.
 *
 * Props:
 *   visits        — visit[]
 *   showPatient   — bool — passed through to each VisitCard
 *   onSelectVisit — (visit) => void — opens the detail modal
 *   loading       — bool — shows skeleton placeholders while data loads
 */
import { ClipboardList } from 'lucide-react'
import VisitCard from './VisitCard'

export default function VisitTimeline({
  visits = [],
  showPatient = true,
  onSelectVisit,
  loading = false,
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-36 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        ))}
      </div>
    )
  }

  if (visits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <ClipboardList size={24} className="text-slate-300" />
        </div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-300">No visit records found.</p>
        <p className="text-xs text-slate-400 mt-1">
          Records will appear here once visits are logged.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {visits.map((visit) => (
        <VisitCard
          key={visit.id}
          visit={visit}
          showPatient={showPatient}
          onView={() => onSelectVisit?.(visit)}
        />
      ))}
    </div>
  )
}
