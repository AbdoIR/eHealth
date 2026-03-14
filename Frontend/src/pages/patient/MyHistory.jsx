/**
 * MyHistory.jsx  (Patient feature #3)
 * Page — shows a patient's own blockchain-verified medical history.
 * Uses the logged-in user's `id` (which matches a patient ID in the registry)
 * to look up their visit records automatically — no search needed.
 */
import { useState, useEffect } from 'react'
import { ShieldCheck, Activity } from 'lucide-react'

import PageHeader       from '../../components/ui/PageHeader'
import Card             from '../../components/ui/Card'
import VisitTimeline    from '../../components/visits/VisitTimeline'
import VisitDetailModal from '../../components/visits/VisitDetailModal'
import { Check, X, Bell } from 'lucide-react'
import { Button } from '@heroui/react'

import { useAuth }   from '../../context/AuthContext'
import { useVisits } from '../../hooks/useVisits'
import { fetchPendingRequests, grantDoctorConsent, refuseDoctorConsent } from '../../blockchain/consent'

export default function MyHistory() {
  const { user }               = useAuth()
  const { getVisitsByPatient } = useVisits()
  const [activeVisit, setActiveVisit] = useState(null)
  
  const [pendingRequests, setPendingRequests] = useState([])
  const [loadingRequests, setLoadingRequests] = useState(true)

  useEffect(() => {
    if (user?.address) {
       fetchPendingRequests(user.address).then(requests => {
          setPendingRequests(requests)
          setLoadingRequests(false)
       })
    }
  }, [user])

  const [visits, setVisits] = useState([])
  const [loadingVisits, setLoadingVisits] = useState(true)

  useEffect(() => {
    if (user?.id) {
       setLoadingVisits(true)
       getVisitsByPatient(user.id).then(res => {
          setVisits(res)
          setLoadingVisits(false)
       })
    }
  }, [user, getVisitsByPatient])

  const handleGrant = async (doctorAddr) => {
      try {
         await grantDoctorConsent(doctorAddr)
         setPendingRequests(prev => prev.filter(r => r.address.toLowerCase() !== doctorAddr.toLowerCase()))
      } catch (err) {
         console.error("Grant failed:", err)
      }
  }

  const handleRefuse = async (doctorAddr) => {
      try {
         await refuseDoctorConsent(doctorAddr)
         setPendingRequests(prev => prev.filter(r => r.address.toLowerCase() !== doctorAddr.toLowerCase()))
      } catch (err) {
         console.error("Refuse failed:", err)
      }
  }

  return (
    <div>
      <PageHeader
        title="My Medical History"
        subtitle="Your personal, blockchain-verified health record — read-only and tamper-proof."
      />

      {/* ── Trust banner ── */}
      <Card className="mb-5">
        <div className="flex items-center gap-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/30 shrink-0">
            <ShieldCheck size={20} className="text-emerald-600" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Blockchain-Secured Records</p>
            <p className="text-xs text-slate-400 mt-0.5">
              All entries are cryptographically signed and stored on-chain.
              No record can be altered or deleted after it is anchored.
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end shrink-0">
            <div className="flex items-center gap-1.5">
              <Activity size={14} className="text-clinical-500" />
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{visits.length}</span>
            </div>
            <p className="text-xs text-slate-400">Total visits</p>
          </div>
        </div>
      </Card>

      {/* ── Pending Requests ── */}
      {!loadingRequests && pendingRequests.length > 0 && (
         <Card className="mb-5 border-orange-200 dark:border-orange-800">
            <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-xl">
               <div className="flex items-center gap-2 mb-3">
                 <Bell size={18} className="text-orange-600 dark:text-orange-400" />
                 <h3 className="text-sm font-semibold text-orange-800 dark:text-orange-200">Pending Consent Requests</h3>
               </div>
               <div className="space-y-3">
                   {pendingRequests.map(request => (
                      <div key={request.address} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-lg border border-orange-100 dark:border-orange-900/40 gap-3">
                         <div>
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{request.name}</p>
                            <p className="text-xs font-mono text-slate-500 mt-0.5">{request.address}</p>
                         </div>
                         <div className="flex gap-2">
                            <Button size="sm" color="danger" variant="flat" onPress={() => handleRefuse(request.address)}>
                              <X size={16} /> Decline
                            </Button>
                            <Button size="sm" color="success" onPress={() => handleGrant(request.address)}>
                              <Check size={16} /> Grant Access
                            </Button>
                         </div>
                      </div>
                   ))}
               </div>
            </div>
         </Card>
      )}

      {/* ── Visit timeline ── */}
      {loadingVisits ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-slate-500 font-medium animate-pulse">Decrypting medical records...</p>
        </div>
      ) : (
        <VisitTimeline
          visits={visits}
          showPatient={false}
          onSelectVisit={setActiveVisit}
        />
      )}

      <VisitDetailModal visit={activeVisit} onClose={() => setActiveVisit(null)} />
    </div>
  )
}
