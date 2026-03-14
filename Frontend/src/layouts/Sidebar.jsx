import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Settings,
  HeartPulse,
  X,
  ClipboardPlus,
  History,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

/** Doctor navigation — full clinical interface. */
const DOCTOR_NAV = [
  { to: '/',            icon: LayoutDashboard, label: 'Overview',         end: true },
  { to: '/patients',    icon: Users,           label: 'Patients' },
  { to: '/add-visit',   icon: ClipboardPlus,   label: 'Log Visit' },
  { to: '/history',     icon: History,         label: 'Patient History' },
  { to: '/appointments',icon: CalendarDays,    label: 'Appointments', disabled: true },
  { to: '/settings',    icon: Settings,        label: 'Settings' },
]

/** Patient navigation — minimal, self-service view. */
const PATIENT_NAV = [
  { to: '/my-history',  icon: HeartPulse, label: 'My Medical History', end: true },
  { to: '/my-doctors',  icon: Users,      label: 'My Doctors' },
  { to: '/settings',    icon: Settings,   label: 'Settings' },
]

/**
 * Sidebar
 *
 * Props:
 *   isOpen    — boolean, controls mobile overlay visibility
 *   onClose   — () => void, called when the close button / overlay is clicked
 */
export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth()
  const NAV_ITEMS = user?.userType === 'patient' ? PATIENT_NAV : DOCTOR_NAV

  return (
    <>
      {/* ───── Mobile backdrop ───── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* ───── Sidebar panel ───── */}
      <aside
        className={`
          fixed top-0 left-0 z-30 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700
          flex flex-col shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 lg:shadow-none lg:z-auto
        `}
        aria-label="Main navigation"
      >
        {/* Brand */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-100 dark:border-slate-700 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-clinical-600 text-white">
              <HeartPulse size={18} strokeWidth={2.5} />
            </span>
            <span className="text-base font-bold text-slate-800 dark:text-white tracking-tight">
              Med<span className="text-clinical-600">Desk</span>
            </span>
          </div>

          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600">
            Main Menu
          </p>
          {NAV_ITEMS.map(({ to, icon: Icon, label, end, disabled }) => {
            if (disabled) {
              return (
                <div
                  key={to}
                  className="sidebar-link opacity-50 cursor-not-allowed pointer-events-none grayscale flex items-center justify-between"
                  title="Coming Soon"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                    <span>{label}</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold uppercase tracking-tighter">
                    Soon
                  </span>
                </div>
              )
            }

            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                <span>{label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* Footer — version / env badge */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-700 shrink-0">
          <p className="text-[11px] text-slate-400 dark:text-slate-600">
            MedDesk v0.1.0
          </p>
        </div>
      </aside>
    </>
  )
}
