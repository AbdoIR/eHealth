import { Activity, Users, CalendarCheck, FileText, TrendingUp, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import { useAuth } from '../context/AuthContext'
import { Button } from '@heroui/react'

/** Quick-stat configuration — wire up real data here later. */
const STATS = [
  {
    label: 'Total Patients',
    value: '1,284',
    change: '+4.6%',
    trend: 'up',
    icon: Users,
    iconBg: 'bg-clinical-50 dark:bg-clinical-950/30',
    iconColor: 'text-clinical-600',
  },
  {
    label: "Today's Appointments",
    value: '18',
    change: '3 pending',
    trend: 'neutral',
    icon: CalendarCheck,
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/30',
    iconColor: 'text-emerald-600',
  },
  {
    label: 'Open Records',
    value: '342',
    change: '-2.1%',
    trend: 'down',
    icon: FileText,
    iconBg: 'bg-violet-50 dark:bg-violet-950/30',
    iconColor: 'text-violet-600',
  },
  {
    label: 'Avg. Recovery Rate',
    value: '94.2%',
    change: '+1.3%',
    trend: 'up',
    icon: TrendingUp,
    iconBg: 'bg-amber-50 dark:bg-amber-950/30',
    iconColor: 'text-amber-600',
  },
]

/** Mock recent activity feed */
const ACTIVITY = [
  { id: 1, text: 'New patient intake: James R. (DOB 1988-03-14)', time: '8:42 AM', type: 'patient' },
  { id: 2, text: 'Lab results attached to Record #9921', time: '9:05 AM', type: 'record' },
  { id: 3, text: 'Appointment confirmed — Emma T. at 2:00 PM', time: '9:30 AM', type: 'appointment' },
  { id: 4, text: "Dr. Chen requested review for Patient #1042's MRI", time: '10:15 AM', type: 'alert' },
  { id: 5, text: 'Discharge summary finalized — Ward B, Bed 7', time: '11:00 AM', type: 'record' },
]

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
          <p
            className={`mt-1 text-xs font-medium ${
              stat.trend === 'up'
                ? 'text-emerald-600'
                : stat.trend === 'down'
                ? 'text-red-500'
                : 'text-slate-400'
            }`}
          >
            {stat.change} vs last month
          </p>
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

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div>
      <PageHeader
        title={`${greeting()}, ${user.name.split(' ')[1]} `}
        subtitle={`Here's what's happening at ${user.clinic} today.`}
        actionButton={
          <Button
            className="bg-clinical-600 text-white hover:bg-clinical-700"
            startContent={<Activity size={15} />}
            onPress={() => navigate('/live-monitor')}
          >
            View Live Monitor
          </Button>
        }
      />

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {STATS.map((s) => (
          <StatCard key={s.label} stat={s} />
        ))}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity feed */}
        <Card className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
            <Activity size={15} className="text-clinical-500" />
            Recent Activity
          </h2>
          <ul className="divide-y divide-slate-100 dark:divide-slate-700">
            {ACTIVITY.map((item) => (
              <li key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <span
                  className={`mt-0.5 flex h-2 w-2 rounded-full shrink-0 ${
                    item.type === 'alert' ? 'bg-amber-400' : 'bg-clinical-400'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 dark:text-slate-200">{item.text}</p>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">{item.time}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Alerts / reminders */}
        <Card>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
            <AlertCircle size={15} className="text-amber-500" />
            Reminders
          </h2>
          <ul className="space-y-3">
            {[
              'Submit monthly billing report by Friday',
              'Staff training session — Thursday 4:00 PM',
              '3 prescriptions awaiting counter-signature',
              'System maintenance scheduled Saturday 2 AM',
            ].map((reminder, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2.5 border border-amber-100 dark:border-amber-800/40"
              >
                <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                {reminder}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
