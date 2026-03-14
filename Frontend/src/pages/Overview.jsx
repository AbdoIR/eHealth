import { Activity, Users, CalendarCheck, FileText, TrendingUp, AlertCircle, HeartPulse, Clock3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Chip } from '@heroui/react'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import { useAuth } from '../context/AuthContext'
import { usePatients } from '../hooks/usePatients'
import { useRecords } from '../hooks/useRecords'
import { Button } from '@heroui/react'

/** Simulated live vitals stream */
const VITAL_STREAM = [
  { ward: 'ICU-A', metric: 'Heart Rate', value: '82 bpm', status: 'stable', updatedAt: 'Just now' },
  { ward: 'Ward B-12', metric: 'SpO2', value: '97%', status: 'stable', updatedAt: '1 min ago' },
  { ward: 'ER-03', metric: 'Blood Pressure', value: '148/96', status: 'warning', updatedAt: '40 sec ago' },
  { ward: 'Ward C-05', metric: 'Temperature', value: '38.1 C', status: 'warning', updatedAt: '2 min ago' },
]

/** Simulated open alerts */
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

function StatCard({ stat }) {
  const Icon = stat.icon
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {stat.label}
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            {stat.value}
          </p>
          {stat.change && (
            <p
              className={`mt-1 text-xs font-medium ${
                stat.trend === 'up'
                  ? 'text-emerald-600'
                  : stat.trend === 'down'
                  ? 'text-red-500'
                  : 'text-slate-400'
              }`}
            >
              {stat.change}
            </p>
          )}
        </div>
        <span className={`flex items-center justify-center w-11 h-11 rounded-xl ${stat.iconBg}`}>
          <Icon size={22} className={stat.iconColor} strokeWidth={1.8} />
        </span>
      </div>
    </Card>
  )
}

export default function Overview() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  // Real data hooks
  const { patients } = usePatients()
  const { records } = useRecords()

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  // Dynamic statistics based on real local state
  const STATS = [
    {
      label: 'My Patients',
      value: patients.length.toString(),
      change: 'In local directory',
      trend: 'neutral',
      icon: Users,
      iconBg: 'bg-clinical-50 dark:bg-clinical-950/30',
      iconColor: 'text-clinical-600',
    },
    {
      label: "Pending Consents",
      value: patients.filter(p => p.consentStatus === 'pending').length.toString(),
      change: 'Awaiting patient approval',
      trend: 'neutral',
      icon: CalendarCheck,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/30',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Local Records',
      value: records.length.toString(),
      change: 'Stored offline',
      trend: 'neutral',
      icon: FileText,
      iconBg: 'bg-violet-50 dark:bg-violet-950/30',
      iconColor: 'text-violet-600',
    },
    {
      label: 'Network Nodes',
      value: '1 (Active)',
      change: 'Connected to Ganache',
      trend: 'up',
      icon: TrendingUp,
      iconBg: 'bg-amber-50 dark:bg-amber-950/30',
      iconColor: 'text-amber-600',
    },
  ]

  return (
    <div>
      <PageHeader
        title={`${greeting()}, ${user.name}`}
        subtitle={`Here's what's happening at ${user.clinic || 'the clinic'} today.`}
        actionButton={
          <Button
            className="bg-clinical-600 text-white hover:bg-clinical-700"
            startContent={<Users size={15} />}
            onPress={() => navigate('/patients')}
          >
            Manage Patients
          </Button>
        }
      />

      {/* Stats grid (Real Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {STATS.map((s) => (
          <StatCard key={s.label} stat={s} />
        ))}
      </div>

      {/* Content grid (Simulated Live Data) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Vitals Stream */}
        <Card className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
            <HeartPulse size={15} className="text-clinical-500" />
            Live Vitals Stream (Simulation)
          </h2>
          <ul className="space-y-2">
            {VITAL_STREAM.map((item) => (
              <li
                key={`${item.ward}-${item.metric}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-3 bg-slate-50/50 dark:bg-slate-800/20"
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

        {/* Alerts / reminders */}
        <Card>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
            <AlertCircle size={15} className="text-amber-500" />
            Alert Queue (Simulation)
          </h2>
          <ul className="space-y-3">
            {ALERTS.map((alert) => (
              <li key={alert.id} className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2.5 bg-slate-50/50 dark:bg-slate-800/20">
                <p className={`text-xs font-semibold ${ALERT_STYLE[alert.severity]}`}>{alert.id}</p>
                <p className="text-sm text-slate-700 dark:text-slate-200 mt-0.5">{alert.text}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-400">
            <Clock3 size={13} />
            Simulated stream refresh every 15 seconds.
          </div>
        </Card>
      </div>
    </div>
  )
}
