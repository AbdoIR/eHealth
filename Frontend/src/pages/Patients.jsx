import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, Search, Filter, RefreshCw } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import FormField from '../components/ui/FormField'
import DataTable from '../components/ui/DataTable'
import {
  Button, Input, Chip, Pagination, Select, SelectItem, Card,
  Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Popover, PopoverTrigger, PopoverContent
} from '@heroui/react'
import { usePatients } from '../hooks/usePatients'
import AddPatientModal from '../components/patients/AddPatientModal'
import ConfirmModal from '../components/ui/ConfirmModal'

const STATUS_COLOR_MAP = {
  Active:     'success',
  Discharged: 'default',
  Critical:   'danger',
}

const COLUMNS = [
  { key: 'id',        label: 'Patient Address' },
  { key: 'name',      label: 'Name' },
  { key: 'bloodType', label: 'Blood Type' },
  { key: 'phone',     label: 'Phone' },
  { key: 'email',     label: 'Email' },
  { key: 'primaryCondition', label: 'Primary Condition' },
  { key: 'status',    label: 'Status' },
  { key: 'actions',   label: 'Actions' },
]

export default function Patients() {
  const navigate = useNavigate()
  const { patients, addPatient: addNewPatient, removePatient, syncPatientsFromHistory } = usePatients()
  const [isSyncing, setIsSyncing] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [patientToRemove, setPatientToRemove] = useState(null)
  const [page, setPage] = useState(1)

  const pageSize = 5

  const filteredPatients = useMemo(() => {
    const q = search.trim().toLowerCase()
    return patients.filter((p) => {
      const matchesSearch = !q
        || p.name.toLowerCase().includes(q)
        || p.id.toLowerCase().includes(q)
        || (p.primaryCondition && p.primaryCondition.toLowerCase().includes(q))
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [patients, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filteredPatients.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  function resetFilters() {
    setStatusFilter('all')
    setSearch('')
    setPage(1)
  }

  async function handleAddPatient(draft) {
    const result = await addNewPatient(draft.address, draft)
    if (result.ok) {
       setShowAddForm(false)
       setPage(1)
    } else {
       console.error("Failed to add patient:", result.message)
    }
  }

  function handleRemovePatient() {
    if (patientToRemove) {
      removePatient(patientToRemove.id)
      setPatientToRemove(null)
    }
  }

  async function handleSync() {
    setIsSyncing(true)
    try {
      const result = await syncPatientsFromHistory()
      if (result.ok) {
        // You could add a toast here if available
        console.log(`Sync complete: ${result.count || 0} patients recovered.`)
      }
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Patient Directory"
        subtitle="Search, browse, and manage all registered patients."
        actionButton={
          <div className="flex gap-2">
            <Button
              variant="flat"
              color="primary"
              startContent={<RefreshCw size={15} className={isSyncing ? 'animate-spin' : ''} />}
              onPress={handleSync}
              isLoading={isSyncing}
            >
              Sync Directory
            </Button>
            <Button
              className="bg-clinical-600 text-white hover:bg-clinical-700"
              startContent={<UserPlus size={15} />}
              onPress={() => setShowAddForm(true)}
            >
              Add Patient
            </Button>
          </div>
        }
      />

      <AddPatientModal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onAdd={handleAddPatient}
      />

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <Input
          placeholder="Search by name, ID, or condition..."
          aria-label="Search patients"
          variant="bordered"
          className="max-w-xs"
          startContent={<Search size={16} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button
          variant="light"
          startContent={<Filter size={16} />}
          onPress={() => setShowFilters(!showFilters)}
        >
          Filters
        </Button>
      </div>

      {/* Filter controls */}
      {showFilters && (
        <Card className="mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <FormField label="Status">
              <Select
                variant="bordered"
                aria-label="Filter by status"
                selectedKeys={[statusFilter]}
                onChange={(e) => setStatusFilter(e.target.value)}
                disableAnimation
              >
                <SelectItem key="all" value="all">All Statuses</SelectItem>
                <SelectItem key="Active" value="Active">Active</SelectItem>
                <SelectItem key="Critical" value="Critical">Critical</SelectItem>
                <SelectItem key="Discharged" value="Discharged">Discharged</SelectItem>
              </Select>
            </FormField>
            <div className="md:col-start-4 flex items-end">
              <Button variant="light" onPress={resetFilters}>Reset Filters</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Patient table */}
      <Card className="p-0 overflow-visible relative z-0">
        <DataTable
          ariaLabel="Patient list"
          columns={COLUMNS}
          data={pageItems}
          emptyContent="No patients match your filters."
          onRowClick={(item) => navigate(`/history?p=${item.id}`)}
          renderCell={(item, columnKey) => {
            switch(columnKey) {
              case 'id': 
                return <span className="font-mono text-xs">{item.id.slice(0, 8)}...{item.id.slice(-6)}</span>
              case 'name': return <span className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</span>
              case 'bloodType': return item.bloodType || 'N/A'
              case 'phone': return <span className="text-slate-500">{item.phone || 'N/A'}</span>
              case 'email': return <span className="text-slate-500">{item.email || 'N/A'}</span>
              case 'primaryCondition': return item.primaryCondition
              case 'status':
                return <Chip color={STATUS_COLOR_MAP[item.status]} variant="flat">{item.status}</Chip>
              case 'actions':
                return (
                  <Button 
                    size="sm" 
                    variant="light" 
                    color="danger" 
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent trigger row click
                      setPatientToRemove(item);
                    }}
                  >
                    Remove
                  </Button>
                )
              default: return null
            }
          }}
        />
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <Pagination
            total={totalPages}
            page={currentPage}
            onChange={setPage}
            aria-label="Patient list pagination"
          />
        </div>
      )}
      <ConfirmModal 
        isOpen={!!patientToRemove}
        onClose={() => setPatientToRemove(null)}
        onConfirm={handleRemovePatient}
        title="Remove Patient Record"
        message={`Are you sure you want to remove ${patientToRemove?.name} from your local directory? This will clear your local notes for this patient.`}
        confirmLabel="Remove Record"
      />
    </div>
  )
}
