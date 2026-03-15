import { useState } from 'react'
import { UserPlus } from 'lucide-react'
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

export default function AddPatientModal({ isOpen, onClose, onAdd }) {
  const [draft, setDraft] = useState({ address: '', condition: '', status: 'Active' })

  function handleAdd() {
    if (!draft.address.startsWith('0x') || draft.address.length !== 42) return
    if (!draft.condition.trim()) return
    onAdd(draft)
    setDraft({ address: '', condition: '', status: 'Active' })
  }

  const isFormInvalid = !draft.address.startsWith('0x') || draft.address.length !== 42 || !draft.condition.trim()

  return (
    <Modal isOpen={isOpen} onClose={onClose} backdrop="blur" classNames={modalClassNames}>
      <ModalContent className={modalSurfaceClass}>
        <ModalHeader className={modalHeaderClass}>
          <div className="flex items-start gap-3">
            <span className={modalAccentIconClass}>
              <UserPlus size={18} />
            </span>
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">Add New Patient</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Create a patient profile with the current accent theme applied.</p>
            </div>
          </div>
        </ModalHeader>
        <ModalBody className={modalBodyClass}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Ethereum Address" className="md:col-span-2">
              <Input
                variant="bordered"
                placeholder="0x..."
                value={draft.address}
                onChange={(e) => setDraft({ ...draft, address: e.target.value })}
              />
            </FormField>
            
            <FormField label="Primary Condition" className="md:col-span-2">
              <Input
                variant="bordered"
                value={draft.condition}
                onChange={(e) => setDraft({ ...draft, condition: e.target.value })}
              />
            </FormField>

            <FormField label="Initial Status" description="Triage level">
              <Select
                variant="bordered"
                aria-label="Patient status"
                defaultSelectedKeys={[draft.status]}
                onChange={(e) => setDraft({ ...draft, status: e.target.value })}
                disableAnimation
              >
                <SelectItem key="Active" value="Active">Active</SelectItem>
                <SelectItem key="Critical" value="Critical">Critical</SelectItem>
                <SelectItem key="Discharged" value="Discharged">Discharged</SelectItem>
              </Select>
            </FormField>
          </div>
        </ModalBody>
        <ModalFooter className={modalFooterClass}>
          <Button variant="bordered" className={modalSecondaryButtonClass} onPress={onClose}>Cancel</Button>
          <Button className={modalPrimaryButtonClass} onPress={handleAdd} isDisabled={isFormInvalid}>Add Patient</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}