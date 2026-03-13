/**
 * AddVisit.jsx  (Doctor feature #1)
 * Page — composes useAddVisitForm + AddVisitForm + PatientSearchBar.
 * Simulates a blockchain anchor delay before showing the success screen.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, ClipboardPlus } from 'lucide-react'
import { Button } from '@heroui/react'

import PageHeader       from '../../components/ui/PageHeader'
import AddVisitForm     from '../../components/visits/AddVisitForm'
import PatientSearchBar from '../../components/patients/PatientSearchBar'

import { useAddVisitForm, VISIT_TYPES, SPECIALTIES } from '../../hooks/useAddVisitForm'
import { useVisits }   from '../../hooks/useVisits'
import { usePatients } from '../../hooks/usePatients'
import { useAuth }     from '../../context/AuthContext'

export default function AddVisit() {
  const { user }           = useAuth()
  const navigate           = useNavigate()
  const { addVisit }       = useVisits()
  const { searchPatients } = usePatients()
  const form               = useAddVisitForm()

  const [submitting, setSubmitting]         = useState(false)
  const [savedVisitId, setSavedVisitId]     = useState(null)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [consent, setConsent]               = useState({ isGranted: false, isPending: false, loading: false })
  const [consentError, setConsentError]     = useState('')

  async function handlePatientSelect(patient) {
    setSelectedPatient(patient)
    form.setField('patientId',   patient?.id   ?? '')
    form.setField('patientName', patient?.name ?? '')
    setConsentError('')

    if (patient?.id && user?.address) {
       setConsent({ isGranted: false, isPending: false, loading: true })
       const { checkConsentState } = await import('../../blockchain/consent')
       const state = await checkConsentState(patient.id, user.address)
       setConsent({ ...state, loading: false })
    } else {
       setConsent({ isGranted: false, isPending: false, loading: false })
    }
  }

  async function handleRequestConsent() {
    if (!selectedPatient) return
    setConsent(prev => ({ ...prev, loading: true }))
    try {
      const { requestPatientConsent } = await import('../../blockchain/consent')
      await requestPatientConsent(selectedPatient.id)
      setConsent(prev => ({ ...prev, isPending: true, loading: false }))
    } catch (err) {
      console.error(err)
      setConsentError("Request failed. Please try again.")
      setConsent(prev => ({ ...prev, loading: false }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.validate()) return

    setSubmitting(true)
    
    try {
      const payload = form.preparePayload();
      const result = await addVisit(selectedPatient.id, { 
        ...payload, 
        doctor: user.name,
        patientName: selectedPatient.name 
      });
      
      if (result.ok) {
        setSavedVisitId(result.txHash);
      }
    } catch (error) {
       console.error(error);
       // We could show a specific error toast here
    } finally {
      setSubmitting(false)
    }
  }

  /* ── Success screen ── */
  if (savedVisitId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center mb-4">
          <CheckCircle2 size={32} className="text-emerald-600" />
        </div>
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Visit recorded successfully</h2>
        <p className="text-sm text-slate-500 mt-2 max-w-sm">
          Record <span className="font-mono font-medium text-slate-700 dark:text-slate-200">{savedVisitId}</span> has
          been submitted and anchored to the blockchain.
        </p>
        <div className="flex gap-3 mt-6">
          <Button
            variant="bordered"
            onPress={() => { form.reset(); setSelectedPatient(null); setSavedVisitId(null) }}
          >
            Add another visit
          </Button>
          <Button
            className="bg-clinical-600 hover:bg-clinical-700 text-white"
            onPress={() => navigate('/patients')}
          >
            Back to Patients
          </Button>
        </div>
      </div>
    )
  }

  /* ── Form ── */
  return (
    <div>
      <PageHeader
        title="Log New Visit"
        subtitle="Record a patient visit — the entry will be anchored to the blockchain."
      />

      <form onSubmit={handleSubmit} noValidate>
        <AddVisitForm
          fields={form.fields}
          errors={form.errors}
          setField={form.setField}
          setListItem={form.setListItem}
          addListItem={form.addListItem}
          removeListItem={form.removeListItem}
          visitTypes={VISIT_TYPES}
          specialties={SPECIALTIES}
          patientSelectorSlot={
            <PatientSearchBar
              selectedPatient={selectedPatient}
              onSelect={handlePatientSelect}
              searchFn={searchPatients}
            />
          }
        />

        {/* ── Consent Alert ── */}
        {selectedPatient && !consent.isGranted && !consent.loading && (
          <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-orange-800 dark:text-orange-400">Consent Required</p>
              <p className="text-xs text-orange-600 dark:text-orange-500 mt-0.5">
                {consent.isPending 
                  ? "A consent request is pending. The patient must approve it before you can record visits." 
                  : "You must have patient consent to record a blockchain visit."}
              </p>
              {consentError && <p className="text-xs text-red-500 mt-1">{consentError}</p>}
            </div>
            {!consent.isPending && (
              <Button 
                size="sm" 
                className="bg-orange-600 text-white font-medium" 
                onPress={handleRequestConsent}
              >
                Request Now
              </Button>
            )}
          </div>
        )}

        {/* ── Actions ── */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="bordered"
            onPress={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-clinical-600 hover:bg-clinical-700 text-white"
            isLoading={submitting}
            isDisabled={!consent.isGranted || submitting}
            startContent={!submitting && <ClipboardPlus size={15} />}
            spinnerPlacement="start"
          >
            {submitting ? 'Anchoring to blockchain…' : 'Submit Visit Record'}
          </Button>
        </div>
      </form>
    </div>
  )
}
