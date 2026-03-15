/**
 * PatientInfoCard.jsx
 * Pure UI — compact demographic summary for a patient.
 *
 * Props:
 *   patient — patient object (from mockPatients / usePatients)
 */
import { User, Droplets, Calendar, Phone, Mail } from 'lucide-react'
import { Chip } from '@heroui/react'

const STATUS_COLORS = {
  Active:     'success',
  Discharged: 'default',
  Critical:   'danger',
}

export default function PatientInfoCard({ patient }) {
  if (!patient) return null

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
      {/* Identity row */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-clinical-100 dark:bg-clinical-950/30 flex items-center justify-center shrink-0">
          <User size={24} className="text-clinical-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{patient.name}</h2>
            <Chip size="sm" color={STATUS_COLORS[patient.status] ?? 'default'} variant="flat">
              {patient.status}
            </Chip>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            {patient.primaryCondition} · {patient.id}
          </p>
        </div>
      </div>

      {/* Details grid */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <InfoPill icon={Droplets} label="Blood Type"    value={patient.bloodType} />
        <InfoPill icon={Phone}    label="Phone"         value={patient.phone} />
        <InfoPill icon={Mail}     label="Email"         value={patient.email} />
      </div>
    </div>
  )
}

function InfoPill({ icon: Icon, label, value }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-1 mb-1">
        <Icon size={10} /> {label}
      </p>
      <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{value || '—'}</p>
    </div>
  )
}
