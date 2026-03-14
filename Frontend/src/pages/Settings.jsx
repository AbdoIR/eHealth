import { Check, User, Lock, Building2, Palette, Sun, Moon, Monitor } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import { useAuth } from '../context/AuthContext'
import { useAppearance } from '../context/AppearanceContext'
import FormField from '../components/ui/FormField'
import { Select, SelectItem, Chip, Button } from '@heroui/react'
import CustomInput, { decoratedSelectClassNames } from '../components/ui/CustomInput'

const ACCENTS = [
  { id: 'blue',    color: '#2578e8', label: 'Blue' },
  { id: 'emerald', color: '#16a34a', label: 'Emerald' },
  { id: 'violet',  color: '#7c3aed', label: 'Violet' },
  { id: 'rose',    color: '#e11d48', label: 'Rose' },
]

const THEME_OPTIONS = [
  {
    value: 'Light',
    label: 'Light',
    description: 'Clean interface with bright surfaces.',
    icon: Sun,
  },
  {
    value: 'Dark',
    label: 'Dark',
    description: 'Low-glare workspace for longer sessions.',
    icon: Moon,
  },
  {
    value: 'System',
    label: 'System',
    description: 'Follow your device appearance automatically.',
    icon: Monitor,
  },
]

const selectItemClassName = 'rounded-xl text-slate-700 data-[hover=true]:bg-clinical-50 data-[selectable=true]:focus:bg-clinical-50 dark:text-slate-100 dark:data-[hover=true]:bg-slate-800 dark:data-[selectable=true]:focus:bg-slate-800'

function SettingSection({ icon: Icon, title, children }) {
  return (
    <Card>
      <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-100 dark:border-slate-700">
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-clinical-50 dark:bg-clinical-950/30 text-clinical-600">
          <Icon size={16} />
        </span>
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
      </div>
      {children}
    </Card>
  )
}

export default function Settings() {
  const { user } = useAuth()
  const { theme, accent, setTheme, setAccent } = useAppearance()

  const formatTime12h = (time24h) => {
    if (!time24h) return '';
    const [hours, minutes] = time24h.split(':');
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12; // Convert '0' to '12'
    return `${h}:${minutes} ${ampm}`;
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Manage your account and preferences. Appearance updates are applied instantly."
        actionButton={
          <Chip color="default" variant="flat">
            Preview mode
          </Chip>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Profile */}
        <SettingSection icon={User} title="Profile Information">
          <div className="space-y-6">
            <FormField label="Full Name">
              <CustomInput defaultValue={user.name} disabled />
            </FormField>
            {user.userType === 'doctor' && (
              <FormField label="Specialty">
                <CustomInput defaultValue="Doctor" disabled />
              </FormField>
            )}
            {user.userType === 'patient' && (
              <>
                <FormField label="Blood Type">
                  <CustomInput defaultValue={user.bloodType} disabled />
                </FormField>
                <FormField label="Phone Number">
                  <CustomInput defaultValue={user.phone} disabled />
                </FormField>
              </>
            )}
          </div>
        </SettingSection>

        {/* Clinic (Doctors Only) */}
        {user.userType === 'doctor' && (
          <SettingSection icon={Building2} title="Clinic Details">
            <div className="space-y-6">
              <FormField label="Clinic Name">
                <CustomInput defaultValue={user.clinic} disabled />
              </FormField>
              <FormField label="Timezone" description="Global display format for dates & times.">
                <CustomInput defaultValue={user.timezone || "America/New_York"} disabled />
              </FormField>
              <FormField label="Working Hours">
                <div className="flex flex-row items-center gap-3">
                  <div className="w-32">
                    <CustomInput type="text" defaultValue={formatTime12h(user.workingHoursStart || "08:00")} className="h-10 text-center" disabled />
                  </div>
                  <span className="text-slate-400 dark:text-slate-500 text-sm font-medium">to</span>
                  <div className="w-32">
                    <CustomInput type="text" defaultValue={formatTime12h(user.workingHoursEnd || "18:00")} className="h-10 text-center" disabled />
                  </div>
                </div>
              </FormField>
            </div>
          </SettingSection>
        )}

        {/* Appearance */}
        <SettingSection icon={Palette} title="Appearance">
          <div className="space-y-6">
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">Theme</legend>
              <div className="space-y-3" role="radiogroup" aria-label="Theme">
                {THEME_OPTIONS.map(({ value, label, description, icon: Icon }) => {
                  const isSelected = theme === value

                  return (
                    <label key={value} className="block cursor-pointer">
                      <input
                        type="radio"
                        name="theme"
                        value={value}
                        checked={isSelected}
                        onChange={(e) => setTheme(e.target.value)}
                        className="sr-only peer"
                      />
                      <div className="flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 transition-all duration-150 hover:bg-slate-100 peer-checked:border-violet-500 peer-checked:bg-violet-50/70 peer-focus-visible:ring-2 peer-focus-visible:ring-violet-500 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white dark:border-slate-700 dark:bg-slate-900/60 dark:hover:bg-slate-800 dark:peer-checked:border-violet-500 dark:peer-checked:bg-violet-950/25 dark:peer-focus-visible:ring-offset-slate-900">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors peer-checked:bg-violet-100 peer-checked:text-violet-700 dark:bg-slate-800 dark:text-slate-300 dark:peer-checked:bg-violet-950/60 dark:peer-checked:text-violet-300">
                            <Icon size={18} />
                          </span>
                          <div className="min-w-0 text-left">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
                          </div>
                        </div>
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white transition-colors peer-checked:border-violet-500 peer-checked:bg-violet-500 dark:border-slate-600 dark:bg-slate-900 dark:peer-checked:border-violet-500 dark:peer-checked:bg-violet-500">
                          <span className="h-2 w-2 rounded-full bg-white opacity-0 transition-opacity peer-checked:opacity-100" />
                        </span>
                      </div>
                    </label>
                  )
                })}
              </div>
            </fieldset>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">Accent Colour</label>
              <p className="text-xs text-slate-400 mb-2">Changes apply immediately — no save required.</p>
              <div className="flex flex-wrap gap-4">
                {ACCENTS.map(({ id, color, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setAccent(id)}
                    className={`h-9 w-9 shrink-0 rounded-full transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-clinical-500 focus-visible:ring-offset-4 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 ${accent === id ? 'ring-2 ring-slate-300 ring-offset-4 ring-offset-white dark:ring-slate-500 dark:ring-offset-slate-900' : ''}`}
                    style={{ backgroundColor: color }}
                    aria-label={label}
                    aria-pressed={accent === id}
                    title={label}
                  >
                    {accent === id && (
                      <span className="flex items-center justify-center w-full h-full text-white">
                        <Check size={14} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                ))}
            </div>
          </div>
          </div>
        </SettingSection>
      </div>
    </div>
  )
}
