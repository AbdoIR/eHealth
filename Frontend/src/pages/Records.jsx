import { useMemo, useState } from 'react'
import { FilePlus, Search, Download, Eye } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import DataTable from '../components/ui/DataTable'
import {
  Button, Input, Chip, Tooltip, Select, SelectItem,
} from '@heroui/react'
import { useRecords } from '../hooks/useRecords'
import UploadRecordModal from '../components/records/UploadRecordModal'
import RecordDetailModal from '../components/records/RecordDetailModal'

const STATUS_COLOR_MAP = {
  Final:            'success',
  'Pending Review': 'warning',
  Draft:            'default',
}

const COLUMNS = [
  { key: 'id',      label: 'Record ID' },
  { key: 'patient', label: 'Patient' },
  { key: 'type',    label: 'Document Type' },
  { key: 'date',    label: 'Date' },
  { key: 'size',    label: 'Size' },
  { key: 'status',  label: 'Status' },
  { key: 'actions', label: 'Actions' },
]

export default function Records() {
  const { records, addRecord } = useRecords()
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [previewRecord, setPreviewRecord] = useState(null)

  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase()
    return records.filter((r) => {
      const matchesSearch = !q
        || r.patient.toLowerCase().includes(q)
        || r.type.toLowerCase().includes(q)
        || r.id.toLowerCase().includes(q)
      const matchesType = typeFilter === 'all'
        || (typeFilter === 'lab' && r.type.toLowerCase().includes('lab'))
        || (typeFilter === 'scan' && r.type.toLowerCase().includes('scan'))
        || (typeFilter === 'discharge' && r.type.toLowerCase().includes('discharge'))
        || (typeFilter === 'report' && r.type.toLowerCase().includes('report'))
        || (typeFilter === 'note' && r.type.toLowerCase().includes('note'))
      return matchesSearch && matchesType
    })
  }, [records, search, typeFilter])

  function downloadRecord(record) {
    const content = [
      `Record ID: ${record.id}`,
      `Patient: ${record.patient}`,
      `Type: ${record.type}`,
      `Date: ${record.date}`,
      `Status: ${record.status}`,
    ].join('\n')

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${record.id}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <PageHeader
        title="Document Records"
        subtitle="Manage all patient-related documents and medical records."
        actionButton={
          <Button
            className="bg-clinical-600 text-white hover:bg-clinical-700"
            startContent={<FilePlus size={15} />}
            onPress={() => setShowUploadForm(true)}
          >
            Upload Record
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <Input
          placeholder="Search by patient, record type, or ID..."
          variant="bordered"
          className="max-w-sm"
          startContent={<Search size={16} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          aria-label="Filter by document type"
          variant="bordered"
          className="max-w-xs"
          selectedKeys={[typeFilter]}
          onChange={(e) => setTypeFilter(e.target.value)}
          disableAnimation
        >
          <SelectItem key="all" value="all">All Types</SelectItem>
          <SelectItem key="report" value="report">Reports</SelectItem>
          <SelectItem key="lab" value="lab">Lab Results</SelectItem>
          <SelectItem key="scan" value="scan">Scans</SelectItem>
          <SelectItem key="note" value="note">Notes</SelectItem>
          <SelectItem key="discharge" value="discharge">Discharge Summaries</SelectItem>
        </Select>
      </div>

      {/* Records table */}
      <Card className="p-0 overflow-visible relative z-0">
        <DataTable
          ariaLabel="Record list"
          columns={COLUMNS}
          data={filteredRecords}
          emptyContent="No records match your filters."
          renderCell={(item, columnKey) => {
            switch (columnKey) {
              case 'id': return item.id
              case 'patient': return item.patient
              case 'type': return item.type
              case 'date': return item.date
              case 'size': return item.size
              case 'status':
                return <Chip color={STATUS_COLOR_MAP[item.status]} variant="flat">{item.status}</Chip>
              case 'actions':
                return (
                  <div className="flex items-center gap-1">
                    <Tooltip content="View Details">
                      <Button isIconOnly variant="light" onPress={() => setPreviewRecord(item)}>
                        <Eye size={16} />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Download">
                      <Button isIconOnly variant="light" onPress={() => downloadRecord(item)}>
                        <Download size={16} />
                      </Button>
                    </Tooltip>
                  </div>
                )
              default: return null
            }
          }}
        />
      </Card>

      {previewRecord && (
        <RecordDetailModal
          record={previewRecord}
          isOpen
          onClose={() => setPreviewRecord(null)}
          onDownload={downloadRecord}
        />
      )}

      <UploadRecordModal
        isOpen={showUploadForm}
        onClose={() => setShowUploadForm(false)}
        onUpload={addRecord}
      />
    </div>
  );
}
