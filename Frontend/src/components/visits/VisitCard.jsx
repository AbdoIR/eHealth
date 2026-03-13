/**
 * VisitCard.jsx
 * Pure UI — renders a compact summary of one medical visit.
 *
 * Props:
 *   visit       — visit object (from mockVisits / useVisits)
 *   showPatient — bool  — show patient name row (true in doctor view, false in patient view)
 *   onView      — () => void   — called when "View details" is clicked
 */
import { Pill, TestTube2, Hash } from 'lucide-react'
import { Chip, Button } from '@heroui/react'

const VISIT_TYPE_COLORS = {
  'Initial Consultation': 'secondary',
  'Follow-up':            'secondary',
  'Routine Check':        'success',
  'Routine Review':       'success',
  'Urgent Consultation':  'danger',
  'Emergency':            'danger',
  'Post-op Review':       'warning',
  'Discharge Summary':    'default',
}

export default function VisitCard({ visit, showPatient = true, onView }) {
  const typeColor = VISIT_TYPE_COLORS[visit.visitType] ?? 'default'
  const abbrHash = visit.blockchainTxHash
    ? `${visit.blockchainTxHash.slice(0, 10)}…${visit.blockchainTxHash.slice(-6)}`
    : '—'

  const visitDate = new Date(visit.date)

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:border-clinical-200 dark:hover:border-clinical-800 hover:shadow-sm transition-all">
      {/* ── Header row ── */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          {/* Date badge */}
          <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 shrink-0 text-center">
            <span className="text-[10px] font-semibold text-slate-400 uppercase leading-tight tracking-wide">
              {visitDate.toLocaleDateString('en-US', { month: 'short' })}
            </span>
            <span className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight">
              {String(visitDate.getDate()).padStart(2, '0')}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Chip size="sm" color={typeColor} variant="flat">
                {visit.visitType}
              </Chip>
              <span className="text-xs text-slate-400">{visit.specialty}</span>
            </div>
            {showPatient && (
              <p className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-100">{visit.patientName}</p>
            )}
            <p className="text-xs text-slate-500 mt-0.5">
              {visit.doctor} · {visit.date}
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="light"
          onPress={onView}
          className="shrink-0 text-clinical-600"
        >
          View details
        </Button>
      </div>

      {/* ── Diagnosis ── */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">
          Diagnosis
        </p>
        <p className="text-sm text-slate-700 dark:text-slate-200">{visit.diagnosis}</p>
      </div>

      {/* ── Prescriptions & lab orders ── */}
      <div className="mt-3 flex flex-wrap gap-4">
        {visit.prescriptions?.length > 0 && (
          <div className="flex items-start gap-1.5 min-w-0">
            <Pill size={13} className="text-clinical-400 mt-0.5 shrink-0" />
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {visit.prescriptions.slice(0, 2).join(', ')}
              {visit.prescriptions.length > 2 && ` +${visit.prescriptions.length - 2} more`}
            </p>
          </div>
        )}
        {visit.labOrders?.length > 0 && (
          <div className="flex items-start gap-1.5 min-w-0">
            <TestTube2 size={13} className="text-emerald-500 mt-0.5 shrink-0" />
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {visit.labOrders.slice(0, 2).join(', ')}
              {visit.labOrders.length > 2 && ` +${visit.labOrders.length - 2} more`}
            </p>
          </div>
        )}
      </div>

      {/* ── Blockchain provenance ── */}
      <div className="mt-3 flex items-center gap-1.5 opacity-60">
        <Hash size={11} className="text-slate-400 shrink-0" />
        <span className="text-[10px] font-mono text-slate-400 truncate">{abbrHash}</span>
        <span className="text-[10px] text-slate-400 shrink-0">
          · Block #{visit.blockNumber?.toLocaleString()}
        </span>
      </div>
    </div>
  )
}
