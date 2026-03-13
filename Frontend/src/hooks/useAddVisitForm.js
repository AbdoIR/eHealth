/**
 * useAddVisitForm.js
 * Form-logic hook — owns all state, validation, and payload preparation
 * for the Add Visit feature. The UI (AddVisitForm.jsx) is kept separate so
 * either layer can be replaced independently.
 */
import { useState, useCallback } from 'react'

export const VISIT_TYPES = [
  'Initial Consultation',
  'Follow-up',
  'Routine Check',
  'Routine Review',
  'Urgent Consultation',
  'Emergency',
  'Post-op Review',
  'Discharge Summary',
]

export const SPECIALTIES = [
  'General Medicine',
  'Cardiology',
  'Endocrinology',
  'Pulmonology',
  'Nephrology',
  'Neurology',
  'Orthopaedics',
  'Dermatology',
  'Oncology',
  'Paediatrics',
]

const today = new Date().toISOString().split('T')[0]

const INITIAL_STATE = {
  patientId: '',
  patientName: '',
  date: today,
  specialty: '',
  visitType: '',
  chiefComplaint: '',
  diagnosis: '',
  treatmentPlan: '',
  notes: '',
  prescriptions: [''],
  labOrders: [''],
}

export function useAddVisitForm() {
  const [fields, setFields] = useState(INITIAL_STATE)
  const [errors, setErrors] = useState({})

  const setField = useCallback((name, value) => {
    setFields((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }, [])

  const setListItem = useCallback((listName, index, value) => {
    setFields((prev) => {
      const updated = [...prev[listName]]
      updated[index] = value
      return { ...prev, [listName]: updated }
    })
  }, [])

  const addListItem = useCallback((listName) => {
    setFields((prev) => ({ ...prev, [listName]: [...prev[listName], ''] }))
  }, [])

  const removeListItem = useCallback((listName, index) => {
    setFields((prev) => ({
      ...prev,
      [listName]: prev[listName].filter((_, i) => i !== index),
    }))
  }, [])

  /** Returns true if valid; populates errors otherwise. */
  function validate() {
    const e = {}
    if (!fields.patientId)              e.patientId       = 'Please select a patient.'
    if (!fields.date)                   e.date            = 'Visit date is required.'
    if (!fields.specialty)              e.specialty       = 'Please select a specialty.'
    if (!fields.visitType)              e.visitType       = 'Please select a visit type.'
    if (!fields.chiefComplaint.trim())  e.chiefComplaint  = 'Chief complaint is required.'
    if (!fields.diagnosis.trim())       e.diagnosis       = 'Diagnosis is required.'
    if (!fields.treatmentPlan.trim())   e.treatmentPlan   = 'Treatment plan is required.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  /** Returns a cleaned payload ready for useVisits.addVisit(). */
  const preparePayload = useCallback(
    () => ({
      ...fields,
      prescriptions: fields.prescriptions.filter((p) => p.trim()),
      labOrders: fields.labOrders.filter((l) => l.trim()),
    }),
    [fields],
  )

  const reset = useCallback(() => {
    setFields(INITIAL_STATE)
    setErrors({})
  }, [])

  return {
    fields,
    errors,
    setField,
    setListItem,
    addListItem,
    removeListItem,
    validate,
    preparePayload,
    reset,
  }
}
