import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { CalendarPlus, Clock, Video, MapPin } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import { Button, Chip } from '@heroui/react'
import AddAppointmentModal from '../components/appointments/AddAppointmentModal'
import AppointmentDetailModal from '../components/appointments/AppointmentDetailModal'

const TODAY_SLOTS = [
  { time: '08:00', patient: 'Emma Torres',    type: 'Follow-up',       mode: 'in-person', status: 'confirmed' },
  { time: '09:00', patient: 'James Richards', type: 'Cardiology Check', mode: 'video',     status: 'confirmed' },
  { time: '10:30', patient: 'Sophia Patel',   type: 'Routine Review',  mode: 'in-person', status: 'pending'   },
  { time: '12:00', patient: '—',              type: 'Lunch Break',     mode: null,         status: 'blocked'   },
  { time: '14:00', patient: 'Noah Williams',  type: 'Consultation',    mode: 'in-person', status: 'confirmed' },
  { time: '15:30', patient: 'Liam Chen',      type: 'Post-op Review',  mode: 'video',     status: 'pending'   },
]

const STATUS_COLOR_MAP = {
  confirmed: 'success',
  pending:   'warning',
  blocked:   'default',
}

export default function Appointments() {
  const [slots, setSlots] = useState(TODAY_SLOTS)
  const [showNewForm, setShowNewForm] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [selectedDay, setSelectedDay] = useState(new Date())

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  function addAppointment(draft) {
    if (!draft.time.trim() || !draft.patient.trim() || !draft.type.trim()) return

    setSlots((prev) => [
      ...prev,
      {
        ...draft,
        status: 'pending',
      },
    ].sort((a, b) => a.time.localeCompare(b.time)))
    setShowNewForm(false)
  }

  return (
    <div>
      <PageHeader
        title="Appointments"
        subtitle={`Schedule and manage patient appointments. Today is ${today}.`}
        actionButton={
          <Button
            className="bg-clinical-600 text-white hover:bg-clinical-700"
            startContent={<CalendarPlus size={15} />}
            onPress={() => setShowNewForm(true)}
          >
            New Appointment
          </Button>
        }
      />

      <AddAppointmentModal
        isOpen={showNewForm}
        onClose={() => setShowNewForm(false)}
        onAdd={addAppointment}
      />

      <AppointmentDetailModal 
        slot={selectedSlot}
        onClose={() => setSelectedSlot(null)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        {/* Calendar */}
        <Card className="p-0 overflow-x-auto">
          <div className="flex justify-center p-2 sm:p-4 min-w-min">
            <DayPicker
              mode="single"
              selected={selectedDay}
              onSelect={setSelectedDay}
              className="m-0 sm:m-4"
            />
          </div>
        </Card>

        {/* Today's Schedule */}
        <Card className="lg:col-span-2 overflow-x-auto">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
            Today's Schedule
          </h2>
          <ul className="divide-y divide-slate-100 dark:divide-slate-700 min-w-[300px]">
            {slots.map((slot) => (
              <li 
                key={slot.time} 
                className="flex flex-col sm:flex-row sm:items-center gap-3 py-3 first:pt-0 last:pb-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 -mx-5 px-5"
                onClick={() => setSelectedSlot(slot)}
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-clinical-600 sm:w-20 shrink-0">
                  <Clock size={14} />
                  {slot.time}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{slot.patient}</p>
                  <p className="text-xs text-slate-500 truncate">{slot.type}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {slot.mode && (
                    <Chip
                      variant="flat"
                      color="default"
                      className="text-xs"
                      startContent={slot.mode === 'video' ? <Video size={12} /> : <MapPin size={12} />}
                    >
                      {slot.mode === 'video' ? 'Video' : 'In-Person'}
                    </Chip>
                  )}
                  <Chip
                    variant="flat"
                    color={STATUS_COLOR_MAP[slot.status]}
                    className="text-xs w-24 justify-center"
                  >
                    {slot.status}
                  </Chip>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
