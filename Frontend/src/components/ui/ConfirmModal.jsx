import React from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react'
import { AlertTriangle } from 'lucide-react'
import {
  modalBodyClass,
  modalClassNames,
  modalFooterClass,
  modalHeaderClass,
  modalSecondaryButtonClass,
  modalSurfaceClass,
} from './modalStyles'

/**
 * ConfirmModal.jsx
 * A reusable, premium-styled confirmation dialog.
 */
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Confirm",
  confirmColor = "danger",
  loading = false
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} backdrop="blur" classNames={modalClassNames}>
      <ModalContent className={modalSurfaceClass}>
        <ModalHeader className={modalHeaderClass}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${confirmColor === 'danger' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
              <AlertTriangle size={20} />
            </div>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-50">{title}</p>
          </div>
        </ModalHeader>
        <ModalBody className={modalBodyClass}>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {message}
          </p>
        </ModalBody>
        <ModalFooter className={modalFooterClass}>
          <Button 
            variant="bordered" 
            className={modalSecondaryButtonClass} 
            onPress={onClose}
            isDisabled={loading}
          >
            Cancel
          </Button>
          <Button 
            color={confirmColor}
            className="font-semibold shadow-sm"
            onPress={onConfirm}
            isLoading={loading}
          >
            {confirmLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
