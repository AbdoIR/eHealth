import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Chip } from '@heroui/react'
import { FileText, User, Calendar, Tag, HardDrive } from 'lucide-react'
import {
  modalAccentIconClass,
  modalBodyClass,
  modalClassNames,
  modalFooterClass,
  modalHeaderClass,
  modalSecondaryButtonClass,
  modalSectionClass,
  modalSurfaceClass,
} from '../ui/modalStyles'

const STATUS_COLOR_MAP = {
  Final: 'success',
  'Pending Review': 'warning',
  Draft: 'default',
}

export default function RecordDetailModal({ record, onClose }) {
  if (!record) return null

  return (
    <Modal isOpen={!!record} onClose={onClose} backdrop="blur" classNames={modalClassNames}>
      <ModalContent className={modalSurfaceClass}>
        <ModalHeader className={modalHeaderClass}>
          <div className="flex items-start gap-3">
            <span className={modalAccentIconClass}>
              <FileText size={18} />
            </span>
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">Record Details</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Inspect document metadata inside the selected accent theme.</p>
            </div>
          </div>
        </ModalHeader>
        <ModalBody className={modalBodyClass}>
          <div className="space-y-4">
            <div className={modalSectionClass}>
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-clinical-600" />
                <span className="font-semibold text-slate-900 dark:text-slate-50">{record.id}</span>
              </div>
            </div>
            <div className={`${modalSectionClass} grid grid-cols-2 gap-4`}>
              <Detail icon={User} label="Patient" value={record.patient} />
              <Detail icon={Tag} label="Type" value={record.type} />
              <Detail icon={Calendar} label="Date" value={record.date} />
              <Detail icon={HardDrive} label="Size" value={record.size} />
              <Detail icon={Calendar} label="Status" value={<Chip color={STATUS_COLOR_MAP[record.status]}>{record.status}</Chip>} />
            </div>
          </div>
        </ModalBody>
        <ModalFooter className={modalFooterClass}>
          <Button variant="bordered" className={modalSecondaryButtonClass} onPress={onClose}>Close</Button>
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