import { useState, useEffect } from 'react'
import { Users, ShieldAlert, ShieldCheck, UserMinus, Bell } from 'lucide-react'
import { Button, Chip, Card } from '@heroui/react'

import PageHeader from '../../components/ui/PageHeader'
import DataTable  from '../../components/ui/DataTable'
import { useAuth } from '../../context/AuthContext'
import { 
  fetchAuthorizedDoctors, 
  revokeDoctorConsent,
  fetchPendingRequests,
  grantDoctorConsent,
  refuseDoctorConsent
} from '../../blockchain/consent'

const COLUMNS = [
  { key: 'address', label: 'Doctor Address' },
  { key: 'status',  label: 'Status' },
  { key: 'actions', label: 'Actions' },
]

export default function MyDoctors() {
  const { user } = useAuth()
  const [doctors, setDoctors] = useState([])
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    if (!user?.address) return
    setLoading(true)
    try {
      const [auth, pend] = await Promise.all([
        fetchAuthorizedDoctors(user.address),
        fetchPendingRequests(user.address)
      ])
      setDoctors(auth.map(addr => ({ id: addr, address: addr, status: 'Authorized' })))
      setPending(pend)
    } catch (err) {
      console.error("Failed to load doctors:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  const handleRevoke = async (doctorAddr) => {
    if (!window.confirm("Are you sure you want to revoke this doctor's access to your medical records?")) return
    try {
      await revokeDoctorConsent(doctorAddr)
      await loadData()
    } catch (err) {
      console.error("Revoke failed:", err)
    }
  }

  const handleGrant = async (doctorAddr) => {
    try {
      await grantDoctorConsent(doctorAddr)
      await loadData()
    } catch (err) {
      console.error("Grant failed:", err)
    }
  }

  const handleRefuse = async (doctorAddr) => {
    try {
      await refuseDoctorConsent(doctorAddr)
      await loadData()
    } catch (err) {
      console.error("Refuse failed:", err)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Relationship Network"
        subtitle="Manage doctors and healthcare providers who have access to your medical profile."
      />

      {/* ── Pending Requests (High Priority) ── */}
      {pending.length > 0 && (
        <Card className="border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/10 shadow-sm">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bell size={18} className="text-orange-600 dark:text-orange-400" />
              <h3 className="text-sm font-bold text-orange-800 dark:text-orange-200 uppercase tracking-wider">
                Pending Access Requests
              </h3>
            </div>
            <div className="space-y-3">
              {pending.map(addr => (
                <div key={addr} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-xl border border-orange-100 dark:border-orange-900/40 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                      <ShieldAlert size={18} className="text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Provider Requesting Access</p>
                      <p className="text-xs font-mono text-slate-500 mt-0.5">{addr}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" color="danger" variant="flat" onPress={() => handleRefuse(addr)}>
                      Decline
                    </Button>
                    <Button size="sm" color="success" className="font-semibold" onPress={() => handleGrant(addr)}>
                      Grant Access
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* ── Authorized Doctors Table ── */}
      <Card className="p-0 overflow-hidden border-slate-200 dark:border-slate-800">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
           <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-clinical-600" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                Currently Authorized Providers
              </h3>
           </div>
        </div>
        
        <DataTable
          ariaLabel="Authorized doctors list"
          columns={COLUMNS}
          data={doctors}
          emptyContent={loading ? "Verifying blockchain authorizations..." : "No doctors currently have access to your records."}
          renderCell={(item, columnKey) => {
            switch(columnKey) {
              case 'address':
                return <span className="font-mono text-xs">{item.address}</span>
              case 'status':
                return <Chip size="sm" color="success" variant="flat">Authorized</Chip>
              case 'actions':
                return (
                  <Button 
                    size="sm" 
                    variant="light" 
                    color="danger" 
                    startContent={<UserMinus size={14} />}
                    onPress={() => handleRevoke(item.address)}
                  >
                    Revoke
                  </Button>
                )
              default: return null
            }
          }}
        />
      </Card>

      <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
         <p className="text-xs text-slate-500 text-center leading-relaxed">
           Doctors listed here can view your medical history and record new visits. 
           You can revoke access at any time through a secure blockchain transaction.
         </p>
      </div>
    </div>
  )
}
