/**
 * PatientHistory.jsx  (Doctor feature #2)
 * Page — lets a doctor search for any patient and browse their full
 * blockchain-verified visit timeline.
 *
 * Supports a `?p=P-XXXX` URL query param so the Patients directory can
 * deep-link directly to a specific patient's history.
 */
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { UserSearch } from 'lucide-react'

import PageHeader       from '../../components/ui/PageHeader'
import Card             from '../../components/ui/Card'
import PatientSearchBar from '../../components/patients/PatientSearchBar'
import PatientInfoCard  from '../../components/patients/PatientInfoCard'
import VisitTimeline    from '../../components/visits/VisitTimeline'
import VisitDetailModal from '../../components/visits/VisitDetailModal'
import { usePatients } from '../../hooks/usePatients'
import { useVisits }   from '../../hooks/useVisits'
import { useAuth }     from '../../context/AuthContext'
import { checkConsentState, requestPatientConsent } from '../../blockchain/consent'
import { Button }      from '@heroui/react'

export default function PatientHistory() {
  const { searchPatients, getPatientById } = usePatients()
  const { getVisitsByPatient }             = useVisits()
  const { user }                           = useAuth()
  const [searchParams]                     = useSearchParams()

  const [selectedPatient, setSelectedPatient] = useState(null)
  const [activeVisit, setActiveVisit]         = useState(null)
  
  const [consentState, setConsentState] = useState({ isGranted: false, isPending: false, loading: false })
  const [requestError, setRequestError] = useState('')

  // Auto-select patient when navigated here with ?p=P-XXXX
  useEffect(() => {
    const id = searchParams.get('p')
    if (id) {
      const patient = getPatientById(id)
      if (patient) setSelectedPatient(patient)
    }
  }, [searchParams, getPatientById])

  // Check consent whenever selected patient changes
  useEffect(() => {
    if (selectedPatient && user) {
       setConsentState(prev => ({ ...prev, loading: true }))
       setRequestError('')
       checkConsentState(selectedPatient.id, user.address).then(state => {
           setConsentState({ isGranted: state.isGranted, isPending: state.isPending, loading: false })
       })
    }
  }, [selectedPatient, user])

  const handleRequestConsent = async () => {
     try {
        setConsentState(prev => ({ ...prev, loading: true }))
        await requestPatientConsent(selectedPatient.id)
        setConsentState(prev => ({ ...prev, isPending: true, loading: false }))
     } catch (err) {
        console.error(err)
        setRequestError("Transaction failed or was rejected.")
        setConsentState(prev => ({ ...prev, loading: false }))
     }
  }

  const [visits, setVisits] = useState([])
  const [loadingVisits, setLoadingVisits] = useState(false)

  // Fetch visits whenever consent is granted and patient is selected
  useEffect(() => {
    if (selectedPatient && consentState.isGranted) {
       setLoadingVisits(true)
       getVisitsByPatient(selectedPatient.id).then(res => {
          setVisits(res)
          setLoadingVisits(false)
       })
    } else {
       setVisits([])
    }
  }, [selectedPatient, consentState.isGranted, getVisitsByPatient])

  return (
    <div>
      <PageHeader
        title="Patient Medical History"
        subtitle="Search for a patient to view their full, blockchain-verified visit history."
      />

      <div className="space-y-5">

        {/* ── Patient search ── */}
        <Card>
          <PatientSearchBar
            label="Find Patient"
            selectedPatient={selectedPatient}
            onSelect={setSelectedPatient}
            searchFn={searchPatients}
          />
        </Card>

        {/* ── Patient demographics card ── */}
        {selectedPatient && <PatientInfoCard patient={selectedPatient} />}

        {/* ── Visit timeline (if consent granted) ── */}
        {selectedPatient && consentState.isGranted ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {visits.length} Visit{visits.length !== 1 ? 's' : ''} on Record
              </h2>
              <span className="text-xs text-slate-400">Sorted newest first</span>
            </div>
            <VisitTimeline
              visits={visits}
              showPatient={false}
              onSelectVisit={setActiveVisit}
            />
          </div>
        ) : selectedPatient && (consentState.loading || loadingVisits) ? (
             <div className="flex flex-col items-center justify-center py-20 text-center">
                 <p className="text-sm text-slate-500 font-medium animate-pulse">Checking blockchain permissions...</p>
             </div>
        ) : selectedPatient && !consentState.isGranted ? (
             <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
                <div className="w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4">
                  <UserSearch size={24} className="text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Access Restricted</h3>
                <p className="text-sm text-slate-500 mb-6 max-w-sm">
                  You do not currently have permission to view {selectedPatient.name}'s medical timeline. 
                  In accordance with HIPAA compliance and blockchain rules, you must request their explicit consent.
                </p>
                
                {requestError && <p className="text-sm text-red-500 mb-4">{requestError}</p>}

                {consentState.isPending ? (
                   <Button size="md" className="bg-slate-200 text-slate-600 font-semibold cursor-not-allowed pointer-events-none" disabled>
                     Waiting for Patient Consent...
                   </Button>
                ) : (
                   <Button onPress={handleRequestConsent} size="md" className="bg-clinical-600 hover:bg-clinical-700 text-white font-semibold shadow-md">
                     Request Access
                   </Button>
                )}
             </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <UserSearch size={24} className="text-slate-300" />
            </div>
            <p className="text-sm text-slate-500 font-medium">No patient selected</p>
            <p className="text-xs text-slate-400 mt-1">
              Use the search above to find a patient and view their history.
            </p>
          </div>
        )}
      </div>

      <VisitDetailModal visit={activeVisit} onClose={() => setActiveVisit(null)} />
    </div>
  )
}
