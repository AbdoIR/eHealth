# Backend Integration Guide

> **Project:** Projet 9 — Application de la Blockchain dans le e-Health  
> **Stack:** React + Vite front-end · API + Blockchain integration  
> This guide is aligned with the current codebase and explains how to replace the local mock/localStorage layer with real authentication, patient registry, and blockchain-backed visit storage.

---

## Current Architecture

The application is already split in a way that makes integration straightforward. The UI layer can stay mostly intact. The main work is in the state and data layers.

```
┌──────────────────────────────────────────────────────┐
│ UI Components                                       │
│ AddVisitForm · VisitTimeline · VisitDetailModal     │
│ PatientSearchBar · PatientInfoCard                  │
├──────────────────────────────────────────────────────┤
│ Pages                                               │
│ AddVisit · PatientHistory · MyHistory               │
│ Patients · Login · Signup                           │
├──────────────────────────────────────────────────────┤
│ Hooks                                               │
│ useVisits · usePatients · useAddVisitForm           │
├──────────────────────────────────────────────────────┤
│ Context                                             │
│ AuthContext                                         │
├──────────────────────────────────────────────────────┤
│ Data / Blockchain / API                             │
│ mockPatients.js · mockVisits.js                     │
│ future: api/* · blockchain/*                        │
└──────────────────────────────────────────────────────┘
```

## Recommended Integration Strategy

For this project, the cleanest production approach is a hybrid model:

1. **Authentication and patient registry** go through a conventional API.
2. **Visit creation** writes to the blockchain, either directly from the client or through a backend service.
3. **Visit history reads** come either from:
   - blockchain event queries, or
   - an indexed API backed by chain data.

This fits the current UX well because the app already treats visit records as blockchain-anchored and patient/account data as ordinary application data.

---

## What Exists Today

### `src/hooks/usePatients.js`
Current behaviour:
- loads patients from localStorage with `MOCK_PATIENTS` as fallback
- supports `addPatient`
- supports `searchPatients`
- supports `getPatientById`

### `src/hooks/useVisits.js`
Current behaviour:
- loads visits from localStorage with `MOCK_VISITS` as fallback
- `addVisit` generates a fake visit id, fake tx hash, and fake block number
- `getVisitsByPatient` is synchronous and sorted newest-first

### `src/context/AuthContext.jsx`
Current behaviour:
- uses localStorage-backed accounts
- includes seeded demo doctor and patient accounts
- `login`, `register`, and `logout` are synchronous local operations

### `src/pages/doctor/AddVisit.jsx`
Current behaviour:
- calls `useAddVisitForm()` for validation and payload creation
- simulates blockchain latency with a `setTimeout`
- calls `addVisit({ ...form.preparePayload(), doctor: user.name })`

### `src/pages/doctor/PatientHistory.jsx`
Current behaviour:
- calls `getVisitsByPatient(selectedPatient.id)` synchronously
- no async loading state yet

### `src/pages/patient/MyHistory.jsx`
Current behaviour:
- calls `getVisitsByPatient(user.id)` synchronously
- no async loading state yet

---

## Data Contracts You Must Preserve

The UI already expects these shapes. Preserve them even if your API or contract names differ internally.

### Patient shape

```ts
type Patient = {
  id: string
  name: string
  dob: string
  gender: string
  bloodType: string
  phone: string
  email: string
  primaryCondition: string
  status: 'Active' | 'Discharged' | 'Critical'
}
```

### Visit shape

```ts
type Visit = {
  id: string
  patientId: string
  patientName: string
  date: string
  doctor: string
  specialty: string
  visitType: string
  chiefComplaint: string
  diagnosis: string
  treatmentPlan: string
  notes?: string
  prescriptions: string[]
  labOrders: string[]
  blockchainTxHash: string
  blockNumber: number
}
```

### Auth user shape

```ts
type User = {
  id: string
  name: string
  email: string
  userType: 'doctor' | 'patient'
  role: string
  clinic: string
  avatar: string | null
}
```

Important:
- for patient users, `user.id` must match the patient registry `id`
- `MyHistory.jsx` depends on that identity match

---

## Step 1 — Replace the Mock Data Layer

The current `mockPatients.js` and `mockVisits.js` are pure fallback data. In production, move the real reads into dedicated API or blockchain service files.

Suggested structure:

```text
src/
  api/
    auth.js
    patients.js
    visits.js
  blockchain/
    client.js
    visits.js
```

### Patients service

```js
// src/api/patients.js
export async function fetchPatients(token) {
  const res = await fetch('/api/patients', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) throw new Error('Failed to load patients')
  return res.json()
}

export async function createPatient(payload, token) {
  const res = await fetch('/api/patients', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) throw new Error('Failed to create patient')
  return res.json()
}
```

### Visits service

```js
// src/api/visits.js
export async function fetchVisitsByPatient(patientId, token) {
  const res = await fetch(`/api/visits?patientId=${encodeURIComponent(patientId)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) throw new Error('Failed to load visits')
  return res.json()
}
```

If your application writes visits directly to chain, reads can still come from either:
- the chain itself using event queries, or
- an indexed backend that returns the same `Visit[]` shape

---

## Step 2 — Replace `usePatients.js`

Current file to update:
- `src/hooks/usePatients.js`

Because the current hook also supports patient creation, the blockchain-ready version should preserve:
- `patients`
- `addPatient`
- `searchPatients`
- `getPatientById`
- and add `loading`, `error`, optionally `refresh`

Suggested pattern:

```js
import { useEffect, useState, useCallback } from 'react'
import { fetchPatients, createPatient } from '../api/patients'
import { getToken } from '../api/auth'

export function usePatients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchPatients(getToken())
      setPatients(data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const addPatient = useCallback(async (newPatient) => {
    const saved = await createPatient(newPatient, getToken())
    setPatients((prev) => [saved, ...prev])
    return saved
  }, [])

  const searchPatients = useCallback(
    (query) => {
      if (!query.trim()) return patients
      const q = query.trim().toLowerCase()
      return patients.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.primaryCondition.toLowerCase().includes(q),
      )
    },
    [patients],
  )

  const getPatientById = useCallback(
    (id) => patients.find((p) => p.id === id) ?? null,
    [patients],
  )

  return { patients, loading, error, addPatient, searchPatients, getPatientById, refresh: load }
}
```

---

## Step 3 — Replace `useVisits.js`

Current file to update:
- `src/hooks/useVisits.js`

This is the most important blockchain integration point.

Today, `addVisit` generates:
- fake `id`
- fake `blockchainTxHash`
- fake `blockNumber`

In production, those values must come from the blockchain transaction result or the indexing backend.

Suggested pattern:

```js
import { useState, useCallback } from 'react'
import { fetchVisitsByPatient } from '../api/visits'
import { postVisit } from '../blockchain/visits'
import { getToken } from '../api/auth'

export function useVisits() {
  const [cache, setCache] = useState({})

  const getVisitsByPatient = useCallback(async (patientId) => {
    if (cache[patientId]) return cache[patientId]

    const visits = await fetchVisitsByPatient(patientId, getToken())
    const sorted = [...visits].sort((a, b) => new Date(b.date) - new Date(a.date))

    setCache((prev) => ({
      ...prev,
      [patientId]: sorted,
    }))

    return sorted
  }, [cache])

  const addVisit = useCallback(async (visitData) => {
    const saved = await postVisit(visitData)

    setCache((prev) => {
      const { [saved.patientId]: _, ...rest } = prev
      return rest
    })

    return saved
  }, [])

  return { addVisit, getVisitsByPatient }
}
```

### Required `visitData` input

This payload is already produced by `useAddVisitForm().preparePayload()` plus the doctor name in `AddVisit.jsx`.

Expected payload before persistence:

```ts
{
  patientId: string
  patientName: string
  date: string
  specialty: string
  visitType: string
  chiefComplaint: string
  diagnosis: string
  treatmentPlan: string
  notes: string
  prescriptions: string[]
  labOrders: string[]
  doctor: string
}
```

---

## Step 4 — Replace `AuthContext.jsx`

Current file to update:
- `src/context/AuthContext.jsx`

Today it does:
- localStorage-backed account list
- seeded doctor and patient demo users
- synchronous `login`, `register`, `logout`

For production, replace those with API calls while preserving the exposed context value:

```js
{ user, login, register, logout, isAuthenticated }
```

Suggested shape:

```js
async function login({ email, password }) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    return { ok: false, message: 'Invalid email or password.' }
  }

  const { user, token } = await res.json()
  localStorage.setItem('hc_token', token)
  saveJSON(USER_STORAGE_KEY, user)
  setUser(user)
  return { ok: true }
}

async function register({ name, email, password, role = '', clinic = '', userType = 'doctor' }) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role, clinic, userType }),
  })

  const body = await res.json()
  if (!res.ok) {
    return { ok: false, message: body.message ?? 'Registration failed.' }
  }

  localStorage.setItem('hc_token', body.token)
  saveJSON(USER_STORAGE_KEY, body.user)
  setUser(body.user)
  return { ok: true }
}

function logout() {
  localStorage.removeItem('hc_token')
  localStorage.removeItem(USER_STORAGE_KEY)
  setUser(null)
}
```

---

## Step 5 — Blockchain Integration

If visits are anchored directly on-chain, add a dedicated blockchain client.

### Install ethers

```bash
npm install ethers
```

### Contract client

```js
// src/blockchain/client.js
import { ethers } from 'ethers'
import VisitRegistryABI from './VisitRegistry.abi.json'

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS

export function getProvider() {
  if (window.ethereum) return new ethers.BrowserProvider(window.ethereum)
  return new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL)
}

export async function getContract(withSigner = false) {
  const provider = getProvider()
  const runner = withSigner ? await provider.getSigner() : provider
  return new ethers.Contract(CONTRACT_ADDRESS, VisitRegistryABI, runner)
}
```

### Write visit on-chain

```js
// src/blockchain/visits.js
import { getContract } from './client'

export async function postVisit(visitData) {
  const contract = await getContract(true)

  const tx = await contract.logVisit(
    visitData.patientId,
    visitData.patientName,
    visitData.date,
    visitData.specialty,
    visitData.visitType,
    visitData.chiefComplaint,
    visitData.diagnosis,
    visitData.treatmentPlan,
    visitData.notes,
    visitData.prescriptions,
    visitData.labOrders,
    visitData.doctor,
  )

  const receipt = await tx.wait()

  return {
    ...visitData,
    id: `V-${receipt.blockNumber}-${receipt.index ?? 0}`,
    blockchainTxHash: receipt.hash,
    blockNumber: receipt.blockNumber,
  }
}
```

### Read patient visits from chain

```js
export async function getPatientVisitsFromChain(patientId) {
  const contract = await getContract()
  const filter = contract.filters.VisitLogged(patientId)
  const events = await contract.queryFilter(filter, 0, 'latest')

  return events.map((event) => ({
    id: event.args.visitId,
    patientId: event.args.patientId,
    patientName: event.args.patientName,
    date: event.args.date,
    doctor: event.args.doctor,
    specialty: event.args.specialty,
    visitType: event.args.visitType,
    chiefComplaint: event.args.chiefComplaint,
    diagnosis: event.args.diagnosis,
    treatmentPlan: event.args.treatmentPlan,
    notes: event.args.notes,
    prescriptions: event.args.prescriptions,
    labOrders: event.args.labOrders,
    blockchainTxHash: event.transactionHash,
    blockNumber: event.blockNumber,
  }))
}
```

### Environment variables

```env
VITE_CONTRACT_ADDRESS=0xYourContractAddress
VITE_RPC_URL=https://your-rpc-endpoint
```

---

## Step 6 — Update the Pages for Async Data

The current pages still assume synchronous hooks. Once you switch the hooks to async, update these pages.

### `src/pages/doctor/AddVisit.jsx`

Remove the artificial delay and await the real write:

```js
async function handleSubmit(e) {
  e.preventDefault()
  if (!form.validate()) return

  setSubmitting(true)
  try {
    const newVisit = await addVisit({
      ...form.preparePayload(),
      doctor: user.name,
    })
    setSavedVisitId(newVisit.id)
  } finally {
    setSubmitting(false)
  }
}
```

### `src/pages/doctor/PatientHistory.jsx`

This page must stop treating `getVisitsByPatient` as synchronous.

```js
const [visits, setVisits] = useState([])
const [loading, setLoading] = useState(false)

useEffect(() => {
  if (!selectedPatient) {
    setVisits([])
    return
  }

  setLoading(true)
  getVisitsByPatient(selectedPatient.id)
    .then(setVisits)
    .finally(() => setLoading(false))
}, [selectedPatient, getVisitsByPatient])

<VisitTimeline
  visits={visits}
  loading={loading}
  showPatient={false}
  onSelectVisit={setActiveVisit}
/>
```

### `src/pages/patient/MyHistory.jsx`

Use the same async loading pattern:

```js
const [visits, setVisits] = useState([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  setLoading(true)
  getVisitsByPatient(user.id)
    .then(setVisits)
    .finally(() => setLoading(false))
}, [user.id, getVisitsByPatient])
```

---

## Suggested File Plan

### Existing files to update

| File | What changes |
|---|---|
| `src/hooks/usePatients.js` | Replace localStorage reads/writes with API calls, keep `addPatient` |
| `src/hooks/useVisits.js` | Replace fake tx/hash generation with blockchain/API integration |
| `src/context/AuthContext.jsx` | Replace demo auth with real auth endpoints |
| `src/pages/doctor/AddVisit.jsx` | Remove artificial delay, await real visit write |
| `src/pages/doctor/PatientHistory.jsx` | Convert to async visit loading |
| `src/pages/patient/MyHistory.jsx` | Convert to async visit loading |

### New files to add

| File | Purpose |
|---|---|
| `src/api/auth.js` | token helpers and auth API wrappers |
| `src/api/patients.js` | patient registry read/create API wrappers |
| `src/api/visits.js` | optional indexed visit read endpoint |
| `src/blockchain/client.js` | ethers provider + contract factory |
| `src/blockchain/visits.js` | blockchain write/read functions |
| `.env` | contract address and RPC URL |

---

## What You Do Not Need to Rewrite

These UI pieces can remain as they are as long as you preserve the data contracts above:

- `src/components/visits/AddVisitForm.jsx`
- `src/components/visits/VisitTimeline.jsx`
- `src/components/visits/VisitDetailModal.jsx`
- `src/components/patients/PatientSearchBar.jsx`
- `src/components/patients/PatientInfoCard.jsx`

`useAddVisitForm.js` also stays valid. It already prepares the exact payload shape needed for a blockchain-backed `addVisit` flow.

---

## Final Integration Notes

1. Keep the visit object shape stable, especially `blockchainTxHash` and `blockNumber`.
2. Keep `user.id` aligned with `patient.id` for patient accounts.
3. Prefer async hooks with local caching instead of re-querying chain data on every render.
4. If direct chain reads are too slow, use an indexed backend for reads and reserve direct chain interaction for writes and verification.
5. The current UI already communicates blockchain anchoring well; the main missing work is replacing the local mock persistence layer.
