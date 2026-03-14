import { useState } from 'react'
import { Upload } from 'lucide-react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Button, Select, SelectItem } from '@heroui/react'
import FormField from '../ui/FormField'
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

export default function UploadRecordModal({ isOpen, onClose, onUpload }) {
  const [draft, setDraft] = useState({ patient: '', type: '', date: new Date().toISOString().split('T')[0], status: 'Draft' })

  function handleUpload() {
    if (!draft.patient.trim() || !draft.type.trim() || !draft.date.trim()) return
    onUpload(draft)
    setDraft({ patient: '', type: '', date: new Date().toISOString().split('T')[0], status: 'Draft' })
  }

  const isFormInvalid = !draft.patient.trim() || !draft.type.trim() || !draft.date.trim()

  return (
    <Modal isOpen={isOpen} onClose={onClose} backdrop="blur" classNames={modalClassNames}>
      <ModalContent className={modalSurfaceClass}>
        <ModalHeader className={modalHeaderClass}>
          <div className="flex items-start gap-3">
            <span className={modalAccentIconClass}>
              <Upload size={18} />
            </span>
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">Upload New Record</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Attach a record with the active appearance preferences reflected in the modal.</p>
            </div>
          </div>
        </ModalHeader>
        <ModalBody className={modalBodyClass}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Patient Name">
              <Input
                variant="bordered"
                value={draft.patient}
                onChange={(e) => setDraft({ ...draft, patient: e.target.value })}
              />
            </FormField>
            <FormField label="Document Type">
              <Input
                variant="bordered"
                value={draft.type}
                onChange={(e) => setDraft({ ...draft, type: e.target.value })}
              />
            </FormField>
            <FormField label="Date">
              <Input
                type="date"
                variant="bordered"
                value={draft.date}
                onChange={(e) => setDraft({ ...draft, date: e.target.value })}
              />
            </FormField>
            <FormField label={<span className="after:content-['*'] after:text-danger after:ml-0.5">Approval Status</span>}>
              <Select
                variant="bordered"
                aria-label="Approval Status"
                selectedKeys={[draft.status]}
                onChange={(e) => setDraft({ ...draft, status: e.target.value })}
                disableAnimation
              >
                <SelectItem key="Draft" value="Draft">Draft</SelectItem>
                <SelectItem key="Pending Review" value="Pending Review">Pending Review</SelectItem>
                <SelectItem key="Final" value="Final">Final</SelectItem>
              </Select>
            </FormField>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">File</label>
              <div className="flex items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-clinical-200 bg-white/75 hover:border-clinical-400 dark:border-clinical-900/70 dark:bg-slate-950/35 dark:hover:border-clinical-700 transition-colors">
                <p className="text-sm text-slate-400">Drag & drop or click to select a file</p>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className={modalFooterClass}>
          <Button variant="bordered" className={modalSecondaryButtonClass} onPress={onClose}>Cancel</Button>
          <Button className={modalPrimaryButtonClass} onPress={handleUpload} isDisabled={isFormInvalid}>Upload Record</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}