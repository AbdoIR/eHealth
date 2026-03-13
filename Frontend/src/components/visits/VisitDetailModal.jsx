/**
 * VisitDetailModal.jsx
 * Pure UI — full-detail overlay for a single visit record.
 *
 * Props:
 *   visit   — visit object, or null (modal is closed when null)
 *   onClose — () => void
 */
import { Pill, TestTube2, Hash, User, Calendar, Stethoscope, FileText } from 'lucide-react'
import {
  Modal, ModalContent, ModalHeader, ModalBody, Chip, Divider,
} from '@heroui/react'
import {
  modalAccentIconClass,
  modalBodyClass,
  modalClassNames,
  modalHeaderClass,
  modalSectionClass,
  modalSurfaceClass,
} from '../ui/modalStyles'

export default function VisitDetailModal({ visit, onClose }) {
  return (
    <Modal
      isOpen={!!visit}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
      backdrop="blur"
      classNames={modalClassNames}
    >
      <ModalContent className={modalSurfaceClass}>
        {visit && (
          <>
            <ModalHeader className={`${modalHeaderClass} flex items-start gap-3`}>
              <span className={`${modalAccentIconClass} shrink-0`}>
                <Stethoscope size={18} />
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-lg font-semibold text-slate-900 dark:text-slate-50">{visit.visitType} - {visit.specialty}</span>
                <span className="text-sm text-slate-500 font-normal dark:text-slate-400">{visit.id} · {visit.date}</span>
              </div>
            </ModalHeader>
            <ModalBody className={`${modalBodyClass} pb-6`}>
              <div className="space-y-5">
                {/* Patient & Doctor grid */}
                <div className={`${modalSectionClass} grid grid-cols-2 gap-4`}>
                  <Detail icon={User}        label="Patient"          value={visit.patientName} />
                  <Detail icon={Stethoscope} label="Attending Doctor" value={visit.doctor} />
                  <Detail icon={Calendar}    label="Date"             value={visit.date} />
                  <Detail icon={FileText}    label="Specialty"        value={visit.specialty} />
                </div>

                <Divider />

                {/* Clinical info */}
                <TextSection label="Chief Complaint"  value={visit.chiefComplaint} />
                <TextSection label="Diagnosis"        value={visit.diagnosis}      highlight />
                <TextSection label="Treatment Plan"   value={visit.treatmentPlan} />
                {visit.notes && <TextSection label="Clinical Notes" value={visit.notes} />}

                {/* Lists */}
                {visit.prescriptions?.filter(Boolean).length > 0 && (
                  <ListSection
                    icon={Pill}
                    label="Prescriptions"
                    items={visit.prescriptions.filter(Boolean)}
                    color="secondary"
                  />
                )}
                {visit.labOrders?.filter(Boolean).length > 0 && (
                  <ListSection
                    icon={TestTube2}
                    label="Lab Orders"
                    items={visit.labOrders.filter(Boolean)}
                    color="success"
                  />
                )}

                <Divider />

                {/* Blockchain provenance */}
                <div className={modalSectionClass}>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                    <Hash size={11} /> Blockchain Provenance
                  </p>
                  <div className="space-y-1.5">
                    <ProvRow label="Transaction Hash" value={visit.blockchainTxHash} mono />
                    <ProvRow label="Block Number"     value={`#${visit.blockNumber?.toLocaleString()}`} />
                  </div>
                </div>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

/* ─── internal sub-components ─── */

function Detail({ icon: Icon, label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mb-0.5">
        <Icon size={11} /> {label}
      </p>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{value || '—'}</p>
    </div>
  )
}

function TextSection({ label, value, highlight = false }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">
        {label}
      </p>
      <p className={`text-sm leading-relaxed ${highlight ? 'font-semibold text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>
        {value || '—'}
      </p>
    </div>
  )
}

function ListSection({ icon: Icon, label, items, color }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
        <Icon size={11} /> {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <Chip key={i} size="sm" variant="flat" color={color}>
            {item}
          </Chip>
        ))}
      </div>
    </div>
  )
}

function ProvRow({ label, value, mono = false }) {
  return (
    <div className="flex justify-between gap-4 text-xs">
      <span className="text-slate-400 shrink-0">{label}</span>
      <span className={`text-slate-600 dark:text-slate-300 truncate text-right ${mono ? 'font-mono text-[10px]' : ''}`}>
        {value}
      </span>
    </div>
  )
}
