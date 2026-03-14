import { useState } from 'react'
import { CalendarPlus } from 'lucide-react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Button, Select, SelectItem } from '@heroui/react'
import FormField from '../ui/FormField'
import { usePatients } from '../../hooks/usePatients'
import {
  modalAccentIconClass,
  modalBodyClass,
  modalClassNames,
  modalFooterClass,
  modalHeaderClass,
  modalPrimaryButtonClass,
  modalSecondaryButtonClass,
  modalSurfaceClass,
} from '../ui/modalStyles'

export default function AddAppointmentModal({ isOpen, onClose, onAdd }) {
  const [draft, setDraft] = useState({ time: '', patient: '', type: '', mode: 'in-person' })
  const { patients } = usePatients()

  // Only show patients who have granted consent
  const consentedPatients = patients.filter(p => p.consentStatus === 'granted')

  function handleAdd() {
    onAdd(draft)
    setDraft({ time: '', patient: '', type: '', mode: 'in-person' })
  }

  const isFormInvalid = !draft.time.trim() || !draft.patient.trim() || !draft.type.trim()

  return (
    <Modal isOpen={isOpen} onClose={onClose} backdrop="blur" classNames={modalClassNames} disableAnimation>
      <ModalContent className={modalSurfaceClass}>
        <ModalHeader className={modalHeaderClass}>
          <div className="flex items-start gap-3">
            <span className={modalAccentIconClass}>
              <CalendarPlus size={18} />
            </span>
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">New Appointment</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Schedule a slot with accent-aware modal styling.</p>
            </div>
          </div>
        </ModalHeader>
        <ModalBody className={modalBodyClass}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Time">
              <Input
                type="time"
                variant="bordered"
                value={draft.time}
                onChange={(e) => setDraft({ ...draft, time: e.target.value })}
              />
            </FormField>
            <FormField label="Patient Name">
              <Select
                variant="bordered"
                aria-label="Patient Name"
                placeholder="Select a patient"
                selectedKeys={draft.patient ? [draft.patient] : []}
                onChange={(e) => setDraft({ ...draft, patient: e.target.value })}
                disableAnimation
              >
                {consentedPatients.length > 0 ? (
                  consentedPatients.map(p => (
                    <SelectItem key={p.id || p.name} value={p.name}>
                      {p.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem key="no-patients" value="" isDisabled>
                    No approved patients
                  </SelectItem>
                )}
              </Select>
            </FormField>
            <FormField label="Appointment Type">
              <Input
                variant="bordered"
                value={draft.type}
                onChange={(e) => setDraft({ ...draft, type: e.target.value })}
              />
            </FormField>
            <FormField label="Mode">
              <Select
                variant="bordered"
                aria-label="Appointment Mode"
                selectedKeys={[draft.mode]}
                onChange={(e) => setDraft({ ...draft, mode: e.target.value })}
                disableAnimation
              >
                <SelectItem key="in-person" value="in-person">In-Person</SelectItem>
                <SelectItem key="video" value="video">Video</SelectItem>
              </Select>
            </FormField>
          </div>
        </ModalBody>
        <ModalFooter className={modalFooterClass}>
          <Button variant="bordered" className={modalSecondaryButtonClass} onPress={onClose}>Cancel</Button>
          <Button className={modalPrimaryButtonClass} onPress={handleAdd} isDisabled={isFormInvalid}>Add Appointment</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}