/**
 * AddVisitForm.jsx
 * Pure UI — renders all form fields for the Add Visit feature.
 * Zero logic: all state and validation live in useAddVisitForm.js.
 * Swap out any section's JSX to apply a custom design without touching the logic.
 *
 * Props:
 *   fields              — form state from useAddVisitForm
 *   errors              — validation errors from useAddVisitForm
 *   setField            — (name, value) => void
 *   setListItem         — (listName, index, value) => void
 *   addListItem         — (listName) => void
 *   removeListItem      — (listName, index) => void
 *   visitTypes          — string[]
 *   specialties         — string[]
 *   patientSelectorSlot — ReactNode  (renders PatientSearchBar)
 */
import { PlusCircle, Trash2 } from 'lucide-react'
import { Select, SelectItem, Button } from '@heroui/react'
import FormField from '../ui/FormField'
import { CustomInput, CustomTextarea, decoratedSelectClassNames } from '../ui/CustomInput'

const selectItemClassName = 'rounded-xl text-slate-700 data-[hover=true]:bg-clinical-50 data-[selectable=true=true]:focus:bg-clinical-50 dark:text-slate-100 dark:data-[hover=true]:bg-slate-800 dark:data-[selectable=true=true]:focus:bg-slate-800'

export default function AddVisitForm({
  fields,
  errors,
  setField,
  setListItem,
  addListItem,
  removeListItem,
  visitTypes,
  specialties,
  patientSelectorSlot,
}) {
  return (
    <div className="space-y-5">

      {/* ── Patient ── */}
      <FormSection title="Patient">
        {patientSelectorSlot}
        {errors.patientId && <p className="text-xs text-danger mt-0.5">{errors.patientId}</p>}
      </FormSection>

      {/* ── Visit Info ── */}
      <FormSection title="Visit Details">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <FormField label={<span className="after:content-['*'] after:text-danger after:ml-0.5">Visit Date</span>}>
            <CustomInput
              type="date"
              value={fields.date}
              onChange={(e) => setField('date', e.target.value)}
              aria-invalid={!!errors.date}
            />
            {errors.date && <p className="mt-1 text-xs text-danger">{errors.date}</p>}
          </FormField>

          <FormField label={<span className="after:content-['*'] after:text-danger after:ml-0.5">Specialty</span>}>
            <Select
              variant="bordered"
              aria-label="Visit specialty"
              placeholder="Select specialty…"
              classNames={decoratedSelectClassNames}
              selectedKeys={fields.specialty ? [fields.specialty] : []}
              onSelectionChange={(keys) => setField('specialty', [...keys][0] || '')}
              isInvalid={!!errors.specialty}
              errorMessage={errors.specialty}
            >
              {specialties.map((s) => <SelectItem key={s} className={selectItemClassName}>{s}</SelectItem>)}
            </Select>
          </FormField>

          <FormField label={<span className="after:content-['*'] after:text-danger after:ml-0.5">Visit Type</span>}>
            <Select
              variant="bordered"
              aria-label="Visit type"
              placeholder="Select type…"
              classNames={decoratedSelectClassNames}
              selectedKeys={fields.visitType ? [fields.visitType] : []}
              onSelectionChange={(keys) => setField('visitType', [...keys][0] || '')}
              isInvalid={!!errors.visitType}
              errorMessage={errors.visitType}
            >
              {visitTypes.map((t) => <SelectItem key={t} className={selectItemClassName}>{t}</SelectItem>)}
            </Select>
          </FormField>
        </div>
      </FormSection>

      {/* ── Clinical Information ── */}
      <FormSection title="Clinical Information">
        <div className="space-y-6">
          <FormField label={<span className="after:content-['*'] after:text-danger after:ml-0.5">Chief Complaint</span>}>
            <CustomTextarea
              rows={2}
              className="min-h-11"
              placeholder="Patient's primary reason for the visit…"
              value={fields.chiefComplaint}
              onChange={(e) => setField('chiefComplaint', e.target.value)}
              aria-invalid={!!errors.chiefComplaint}
            />
            {errors.chiefComplaint && <p className="mt-1 text-xs text-danger">{errors.chiefComplaint}</p>}
          </FormField>

          <FormField label={<span className="after:content-['*'] after:text-danger after:ml-0.5">Diagnosis</span>}>
            <CustomInput
              placeholder="Primary diagnosis…"
              value={fields.diagnosis}
              onChange={(e) => setField('diagnosis', e.target.value)}
              aria-invalid={!!errors.diagnosis}
            />
            {errors.diagnosis && <p className="mt-1 text-xs text-danger">{errors.diagnosis}</p>}
          </FormField>

          <FormField label={<span className="after:content-['*'] after:text-danger after:ml-0.5">Treatment Plan</span>}>
            <CustomTextarea
              rows={3}
              placeholder="Describe the treatment plan and recommendations…"
              value={fields.treatmentPlan}
              onChange={(e) => setField('treatmentPlan', e.target.value)}
              aria-invalid={!!errors.treatmentPlan}
            />
            {errors.treatmentPlan && <p className="mt-1 text-xs text-danger">{errors.treatmentPlan}</p>}
          </FormField>

          <FormField label="Clinical Notes">
            <CustomTextarea
              rows={3}
              placeholder="Additional observations, vitals, context (optional)…"
              value={fields.notes}
              onChange={(e) => setField('notes', e.target.value)}
            />
          </FormField>
        </div>
      </FormSection>

      {/* ── Prescriptions ── */}
      <FormSection title="Prescriptions">
        <DynamicList
          items={fields.prescriptions}
          placeholder="e.g. Amlodipine 5 mg once daily"
          onAdd={() => addListItem('prescriptions')}
          onChange={(i, v) => setListItem('prescriptions', i, v)}
          onRemove={(i) => removeListItem('prescriptions', i)}
        />
      </FormSection>

      {/* ── Lab Orders ── */}
      <FormSection title="Lab Orders">
        <DynamicList
          items={fields.labOrders}
          placeholder="e.g. CBC, Lipid Panel"
          onAdd={() => addListItem('labOrders')}
          onChange={(i, v) => setListItem('labOrders', i, v)}
          onRemove={(i) => removeListItem('labOrders', i)}
        />
      </FormSection>
    </div>
  )
}

/* ─── internal helpers ─── */

function FormSection({ title, children }) {
  return (
    <fieldset className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-4">
      <legend className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 px-1">
        {title}
      </legend>
      {children}
    </fieldset>
  )
}

function DynamicList({ items, placeholder, onAdd, onChange, onRemove }) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <CustomInput
            value={item}
            placeholder={placeholder}
            onChange={(e) => onChange(i, e.target.value)}
            className="flex-1"
          />
          {items.length > 1 && (
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="danger"
              onPress={() => onRemove(i)}
              aria-label="Remove item"
            >
              <Trash2 size={15} />
            </Button>
          )}
        </div>
      ))}
      <Button
        size="sm"
        variant="light"
        startContent={<PlusCircle size={14} />}
        onPress={onAdd}
        className="text-clinical-600"
      >
        Add another
      </Button>
    </div>
  )
}
