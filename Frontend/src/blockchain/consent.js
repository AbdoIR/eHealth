import { getContract } from './client'

export async function checkConsentState(patientAddress, doctorAddress) {
  try {
    const contract = await getContract()
    const isGranted = await contract.patientConsent(patientAddress, doctorAddress)
    const isPending = await contract.pendingConsent(patientAddress, doctorAddress)

    return { isGranted, isPending }
  } catch (error) {
    console.error("Failed to fetch consent state:", error)
    return { isGranted: false, isPending: false }
  }
}

export async function requestPatientConsent(patientAddress) {
  const contract = await getContract(true)
  const tx = await contract.requestConsent(patientAddress)
  await tx.wait()
  return tx
}

export async function fetchPendingRequests(patientAddress) {
  try {
     const contract = await getContract()
     // Query the past ConsentRequested events where the patient is the logged in user
     const filter = contract.filters.ConsentRequested(patientAddress)
     const events = await contract.queryFilter(filter, 0, 'latest')

     // We only want the unique latest requests that are STILL pending
     const pendingDoctors = []
     for (const event of events) {
         const doctorAddress = event.args.doctor
         // Check if it's still pending (not granted and not refused yet)
         const isPending = await contract.pendingConsent(patientAddress, doctorAddress)
         if (isPending && !pendingDoctors.includes(doctorAddress)) {
             pendingDoctors.push(doctorAddress)
         }
     }

     return pendingDoctors
  } catch (error) {
     console.error("Failed to fetch pending requests:", error)
     return []
  }
}

export async function grantDoctorConsent(doctorAddress) {
  const contract = await getContract(true)
  const tx = await contract.grantConsent(doctorAddress)
  await tx.wait()
  return tx
}

export async function refuseDoctorConsent(doctorAddress) {
  const contract = await getContract(true)
  const tx = await contract.refuseConsent(doctorAddress)
  await tx.wait()
  return tx
}

export async function revokeDoctorConsent(doctorAddress) {
  const contract = await getContract(true)
  const tx = await contract.revokeConsent(doctorAddress)
  await tx.wait()
  return tx
}
export async function fetchAuthorizedDoctors(patientAddress) {
  try {
    const contract = await getContract()
    // 1. Get all doctors who were EVER granted consent
    const grantFilter = contract.filters.ConsentGranted(patientAddress)
    const grantEvents = await contract.queryFilter(grantFilter, 0, 'latest')
    
    // 2. Get all doctors who had consent revoked
    const revokeFilter = contract.filters.ConsentRevoked(patientAddress)
    const revokeEvents = await contract.queryFilter(revokeFilter, 0, 'latest')

    const authorizedSet = new Set()
    for (const e of grantEvents) authorizedSet.add(e.args.doctor)
    for (const e of revokeEvents) authorizedSet.delete(e.args.doctor)

    return Array.from(authorizedSet)
  } catch (error) {
    console.error("Failed to fetch authorized doctors:", error)
    return []
  }
}
