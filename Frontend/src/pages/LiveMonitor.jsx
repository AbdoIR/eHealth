import { Activity, HeartPulse, BedDouble, BellRing, Clock3 } from 'lucide-react'
import { Chip } from '@heroui/react'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'

const VITAL_STREAM = [
  { ward: 'ICU-A', metric: 'Heart Rate', value: '82 bpm', status: 'stable', updatedAt: 'Just now' },
  { ward: 'Ward B-12', metric: 'SpO2', value: '97%', status: 'stable', updatedAt: '1 min ago' },
  { ward: 'ER-03', metric: 'Blood Pressure', value: '148/96', status: 'warning', updatedAt: '40 sec ago' },
  { ward: 'Ward C-05', metric: 'Temperature', value: '38.1 C', status: 'warning', updatedAt: '2 min ago' },
]

const ALERTS = [
  { id: 'AL-1001', text: 'Patient P-1005 requires immediate review', severity: 'critical' },
  { id: 'AL-1002', text: 'Lab delta detected for Patient P-1002', severity: 'warning' },
  { id: 'AL-1003', text: 'Vitals stream resumed for Device D-201', severity: 'info' },
]

const STATUS_STYLE = {
  stable: { color: 'success', label: 'Stable' },
  warning: { color: 'warning', label: 'Attention' },
}

const ALERT_STYLE = {
  critical: 'text-danger',
  warning: 'text-warning',
  info: 'text-primary',
}

export default function LiveMonitor() {
  return (
    <div>
      <PageHeader
        title="Live Monitor"
        subtitle="Real-time operational pulse for active wards, triage stream, and urgent alerts."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <MetricCard icon={HeartPulse} title="Active Bedside Feeds" value="128" note="+6 in last hour" />
        <MetricCard icon={BedDouble} title="Occupied Beds" value="74" note="88% utilization" />
        <MetricCard icon={Activity} title="Events / Minute" value="42" note="Normal range" />
        <MetricCard icon={BellRing} title="Open Alerts" value="3" note="1 critical" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Vitals Stream</h2>
          <ul className="space-y-2">
            {VITAL_STREAM.map((item) => (
              <li
                key={`${item.ward}-${item.metric}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{item.ward}</p>
                  <p className="text-xs text-slate-500">{item.metric}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{item.value}</p>
                  <p className="text-xs text-slate-400">{item.updatedAt}</p>
                </div>
                <Chip size="sm" variant="flat" color={STATUS_STYLE[item.status].color}>
                  {STATUS_STYLE[item.status].label}
                </Chip>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Alert Queue</h2>
          <ul className="space-y-3">
            {ALERTS.map((alert) => (
              <li key={alert.id} className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2.5">
                <p className={`text-xs font-semibold ${ALERT_STYLE[alert.severity]}`}>{alert.id}</p>
                <p className="text-sm text-slate-700 dark:text-slate-200 mt-0.5">{alert.text}</p>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <Clock3 size={13} />
            Simulated stream refresh every 15 seconds.
          </div>
        </Card>
      </div>
    </div>
  )
}

function MetricCard({ icon: Icon, title, value, note }) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
          <p className="mt-1 text-xs text-slate-400">{note}</p>
        </div>
        <span className="w-10 h-10 rounded-xl bg-clinical-50 dark:bg-clinical-950/30 text-clinical-600 flex items-center justify-center">
          <Icon size={19} />
        </span>
      </div>
    </Card>
  )
}
