import { useState, useCallback } from 'react'

const STORAGE_KEY = 'hc_records'

function loadRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveRecords(records) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch (e) {
    console.error('Failed to save records to localStorage', e)
  }
}

export function useRecords() {
  const [records, setRecords] = useState(loadRecords)

  const addRecord = useCallback((newRecord) => {
    const newId = `REC-${Math.floor(Math.random() * 9000) + 1000}`
    const recordWithId = { ...newRecord, id: newId, size: `${(Math.random() * 5).toFixed(1)} MB` }
    setRecords((prev) => {
      const updated = [recordWithId, ...prev]
      saveRecords(updated)
      return updated
    })
  }, [])

  return { records, addRecord }
}