/**
 * PatientSearchBar.jsx
 * Pure UI — searchable combobox for selecting a patient.
 * Closes on outside click; shows a "no results" state when needed.
 *
 * Props:
 *   label           — string  — form label text
 *   selectedPatient — patient object | null
 *   onSelect        — (patient | null) => void
 *   searchFn        — (query: string) => patient[]  (from usePatients)
 */
import { useState, useRef, useEffect } from 'react'
import { Search, User, ChevronRight } from 'lucide-react'
import CustomInput from '../ui/CustomInput'

export default function PatientSearchBar({
  label = 'Patient',
  selectedPatient,
  onSelect,
  searchFn,
}) {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen]       = useState(false)
  const containerRef          = useRef(null)

  // Re-run search whenever the query changes
  useEffect(() => {
    let active = true;
    const runSearch = async () => {
       const res = await searchFn(query);
       if (active) setResults(res);
    };
    runSearch();
    return () => { active = false; };
  }, [query, searchFn])

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function choose(patient) {
    onSelect(patient)
    setQuery('')
    setOpen(false)
  }

  // ── Selected state ──
  if (selectedPatient) {
    return (
      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-clinical-100 dark:bg-clinical-950/30 flex items-center justify-center shrink-0">
            <User size={16} className="text-clinical-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{selectedPatient.name}</p>
            <p className="text-xs text-slate-400">
              {selectedPatient.id} · {selectedPatient.primaryCondition}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="text-xs font-medium text-clinical-600 hover:text-clinical-800 transition-colors"
        >
          Change
        </button>
      </div>
    )
  }

  // ── Search state ──
  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
        {label} <span className="text-red-500">*</span>
      </label>

      <div className="relative">
        <CustomInput
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Search by name, ID, or condition…"
          startAdornment={<Search size={15} />}
        />
      </div>

      {/* Dropdown results */}
      {open && results.length > 0 && (
        <ul
          className="absolute z-20 left-0 right-0 mt-1 max-h-56 overflow-y-auto
                     bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg"
          role="listbox"
        >
          {results.map((p) => (
            <li
              key={p.id}
              role="option"
              aria-selected={false}
              onClick={() => choose(p)}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-clinical-50 dark:hover:bg-clinical-950/20 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-clinical-100 dark:bg-clinical-950/30 flex items-center justify-center shrink-0">
                <User size={14} className="text-clinical-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{p.name}</p>
                <p className="text-xs text-slate-400 truncate">
                  {p.id} · {p.primaryCondition}
                </p>
              </div>
              <ChevronRight size={14} className="text-slate-300 shrink-0" />
            </li>
          ))}
        </ul>
      )}

      {/* No results */}
      {open && query.trim() && results.length === 0 && (
        <div className="absolute z-20 left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg px-4 py-3">
          <p className="text-sm text-slate-400 text-center">
            No patients found for "{query}"
          </p>
        </div>
      )}
    </div>
  )
}
