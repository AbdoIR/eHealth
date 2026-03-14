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
     const pendingDoctorsMap = new Map() // Use map for distinct addresses
     
     for (const event of events) {
         const doctorAddress = event.args.doctor.toLowerCase() // normalize
         
         // Check if it's still pending (not granted and not refused yet)
         const isPending = await contract.pendingConsent(patientAddress, doctorAddress)
         if (isPending && !pendingDoctorsMap.has(doctorAddress)) {
             try {
                const docName = await contract.getDoctorProfile(doctorAddress);
                pendingDoctorsMap.set(doctorAddress, { address: event.args.doctor, name: docName })
             } catch (e) {
                pendingDoctorsMap.set(doctorAddress, { address: event.args.doctor, name: "Doctor " + doctorAddress.slice(0, 6) })
             }
         }
     }

     return Array.from(pendingDoctorsMap.values())
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

    const authorizedMap = new Map() // track by normalized lowercase address
    
    // Add all granted
    for (const e of grantEvents) {
        const addr = e.args.doctor.toLowerCase()
        if (!authorizedMap.has(addr)) {
            try {
               const docName = await contract.getDoctorProfile(e.args.doctor);
               authorizedMap.set(addr, { address: e.args.doctor, name: docName })
            } catch (err) {
               authorizedMap.set(addr, { address: e.args.doctor, name: "Doctor " + addr.slice(0, 6) })
            }
        }
    }
    
    // Remove any revoked
    for (const e of revokeEvents) {
        const addr = e.args.doctor.toLowerCase()
        // If a revocation event happened, we remove them from the authorized set.
        // Even if there were multiple grants for the same doctor, a revocation revokes all.
        authorizedMap.delete(addr) 
    }

    return Array.from(authorizedMap.values())
  } catch (error) {
    console.error("Failed to fetch authorized doctors:", error)
    return []
  }
}
