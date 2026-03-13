import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Chip } from '@heroui/react'
import { Clock, Video, MapPin, User, Calendar, Tag } from 'lucide-react'
import {
  modalAccentIconClass,
  modalBodyClass,
  modalClassNames,
  modalFooterClass,
  modalHeaderClass,
  modalPrimaryButtonClass,
  modalSecondaryButtonClass,
  modalSectionClass,
  modalSurfaceClass,
} from '../ui/modalStyles'

const STATUS_COLOR_MAP = {
  confirmed: 'success',
  pending: 'warning',
  blocked: 'default',
}

export default function AppointmentDetailModal({ slot, onClose }) {
  if (!slot) return null

  return (
    <Modal isOpen={!!slot} onClose={onClose} backdrop="blur" classNames={modalClassNames}>
      <ModalContent className={modalSurfaceClass}>
        <ModalHeader className={modalHeaderClass}>
          <div className="flex items-start gap-3">
            <span className={modalAccentIconClass}>
              <Clock size={18} />
            </span>
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">Appointment Details</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Review the scheduled slot and its current status.</p>
            </div>
          </div>
        </ModalHeader>
        <ModalBody className={modalBodyClass}>
          <div className="space-y-4">
            <div className={modalSectionClass}>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-clinical-600" />
                <span className="font-semibold text-slate-900 dark:text-slate-50">{slot.time}</span>
              </div>
            </div>
            <div className={`${modalSectionClass} grid grid-cols-2 gap-4`}>
              <Detail icon={User} label="Patient" value={slot.patient} />
              <Detail icon={Tag} label="Type" value={slot.type} />
              <Detail icon={slot.mode === 'video' ? Video : MapPin} label="Mode" value={slot.mode === 'video' ? 'Video' : 'In-Person'} />
              <Detail icon={Calendar} label="Status" value={<Chip color={STATUS_COLOR_MAP[slot.status]}>{slot.status}</Chip>} />
            </div>
          </div>
        </ModalBody>
        <ModalFooter className={modalFooterClass}>
          <Button variant="bordered" className={modalSecondaryButtonClass} onPress={onClose}>Close</Button>
          <Button className={modalPrimaryButtonClass}>Edit Appointment</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

function Detail({ icon: Icon, label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mb-0.5">
        <Icon size={11} /> {label}
      </p>
      <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{value || '—'}</div>
    </div>
  )
}