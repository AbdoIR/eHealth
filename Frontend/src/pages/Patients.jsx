import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, Search, Filter } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import FormField from '../components/ui/FormField'
import DataTable from '../components/ui/DataTable'
import {
  Button, Input, Chip, Pagination, Select, SelectItem, Card,
  Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Popover, PopoverTrigger, PopoverContent
} from '@heroui/react'
import { usePatients } from '../hooks/usePatients'
import AddPatientModal from '../components/patients/AddPatientModal'

const STATUS_COLOR_MAP = {
  Active:     'success',
  Discharged: 'default',
  Critical:   'danger',
}

const COLUMNS = [
  { key: 'id',        label: 'Patient ID' },
  { key: 'name',      label: 'Name' },
  { key: 'dob',       label: 'Date of Birth' },
  { key: 'condition', label: 'Primary Condition' },
  { key: 'status',    label: 'Status' },
  { key: 'actions',   label: 'Actions' },
]

export default function Patients() {
  const navigate = useNavigate()
  const { patients, addPatient: addNewPatient, removePatient } = usePatients()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [page, setPage] = useState(1)

  const pageSize = 5

  const filteredPatients = useMemo(() => {
    const q = search.trim().toLowerCase()
    return patients.filter((p) => {
      const matchesSearch = !q
        || p.name.toLowerCase().includes(q)
        || p.id.toLowerCase().includes(q)
        || (p.condition && p.condition.toLowerCase().includes(q))
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

  function handleRemovePatient(id) {
    if (window.confirm("Are you sure you want to remove this patient from your directory? This will not delete their blockchain data.")) {
      removePatient(id)
    }
  }

  return (
    <div>
      <PageHeader
        title="Patient Directory"
        subtitle="Search, browse, and manage all registered patients."
        actionButton={
          <Button
            className="bg-clinical-600 text-white hover:bg-clinical-700"
            startContent={<UserPlus size={15} />}
            onPress={() => setShowAddForm(true)}
          >
            Add Patient
          </Button>
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
              case 'id': return item.id
              case 'name': return item.name
              case 'dob': return item.dob
              case 'condition': return item.condition
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
                      handleRemovePatient(item.id);
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
    </div>
  )
}
