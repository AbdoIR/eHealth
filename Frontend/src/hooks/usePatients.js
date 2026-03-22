import { useState, useCallback, useEffect } from 'react'
import { getContract } from '../blockchain/client'
import { useAuth } from '../context/AuthContext'

const BASE_STORAGE_KEY = 'hc_patients_v3'
const STATUS_TO_CODE = { Active: 0, Critical: 1, Discharged: 2 }
const CODE_TO_STATUS = { 0: 'Active', 1: 'Critical', 2: 'Discharged' }

function normalizeStatus(status) {
  if (status === 'Critical' || status === 'Discharged') return status
  return 'Active'
}

export function usePatients() {
  const { user } = useAuth()
  
  // Create a unique storage key for this specific doctor AND network
  const [chainId, setChainId] = useState(() => window.ethereum?.chainId || 'unknown')
  const storageKey = user?.address 
    ? `${BASE_STORAGE_KEY}_${chainId}_${user.address.toLowerCase()}` 
    : BASE_STORAGE_KEY

  // Initialize state lazily based on the current storage key
  const [patients, setPatients] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  // Whenever the user changes (e.g. login/logout with different metamask accounts),
  // reload the patient list from that user's specific cache.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      setPatients(raw ? JSON.parse(raw) : [])
    } catch {
      setPatients([])
    }
  }, [storageKey])

  const saveToCache = (updated) => {
    localStorage.setItem(storageKey, JSON.stringify(updated))
  }

  const getLastKnownPatientMetadata = useCallback((address) => {
    const target = address.toLowerCase()
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i)
      if (!key || !key.startsWith(BASE_STORAGE_KEY)) continue
      try {
        const raw = localStorage.getItem(key)
        if (!raw) continue
        const list = JSON.parse(raw)
        if (!Array.isArray(list)) continue
        const found = list.find((p) => p?.id?.toLowerCase?.() === target)
        if (found) {
          return {
            primaryCondition: found.primaryCondition,
            status: normalizeStatus(found.status),
          }
        }
      } catch {
      }
    }
    return null
  }, [])

  const readOnChainDirectoryMetadata = useCallback(async (contract, patientAddress) => {
    if (!user?.address) return null
    try {
      const [primaryCondition, statusCode, isSet] = await contract.getDirectoryMetadata(user.address, patientAddress)
      if (!isSet) return null
      return {
        primaryCondition: (primaryCondition || '').trim(),
        status: CODE_TO_STATUS[Number(statusCode)] || 'Active',
      }
    } catch {
      return null
    }
  }, [user?.address])

  const addPatientByAddress = useCallback(async (address, metadata = {}) => {
    try {
      const contract = await getContract();
      const isPatientObj = await contract.patients(address);
      const isRegistered = isPatientObj.isRegistered;
      
      if (!isRegistered) {
        return { ok: false, message: "This address is not registered as a patient on the blockchain." };
      }

      // Check if already in list
      const normalizedAddr = address.toLowerCase();
      const existing = patients.find(p => p.id.toLowerCase() === normalizedAddr);
      if (existing) {
        return { ok: false, message: "This patient is already in your directory." };
      }

      // ENFORCEMENT: Trigger on-chain consent request if not already requested
      const { checkConsentState, requestPatientConsent } = await import('../blockchain/consent');
      const { getProvider } = await import('../blockchain/client');
      
      const provider = getProvider();
      const signer = await provider.getSigner();
      const doctorAddress = await signer.getAddress();
      
      const { isGranted, isPending } = await checkConsentState(address, doctorAddress);
      
      if (!isGranted && !isPending) {
        await requestPatientConsent(address);
      }

      const profile = await contract.getPatientProfile(address);
      const initialStatus = normalizeStatus(metadata.status)
      const initialCondition = (metadata.condition || '').trim() || 'Clinical Record'

      const newPatient = {
        id: normalizedAddr,
        name: profile.name || metadata.name || ("Patient " + address.slice(0, 6)),
        status: initialStatus,
        primaryCondition: initialCondition,
        bloodType: profile.bloodType || "Unknown",
        phone: profile.phone || "N/A",
        email: profile.email || (address.slice(0, 8) + "@eth.mail"),
        consentStatus: isGranted ? 'granted' : 'pending'
      };

      setPatients(prev => {
        const updated = [...prev, newPatient];
        saveToCache(updated);
        return updated;
      });

      try {
        await contract.getDirectoryMetadata(doctorAddress, normalizedAddr)
        const writableContract = await getContract(true)
        const tx = await writableContract.setDirectoryMetadata(
          normalizedAddr,
          initialCondition,
          STATUS_TO_CODE[initialStatus]
        )
        await tx.wait()
      } catch {
      }

      return { ok: true, patient: newPatient };
    } catch (error) {
      console.error("Failed to add patient (consent request failed):", error);
      const msg = error.reason || error.message || "Failed to broadcast consent request to blockchain.";
      return { ok: false, message: msg };
    }
  }, [patients, storageKey]);

  const searchPatients = useCallback(async (query) => {
    if (!query.trim()) return patients;
    
    const q = query.trim().toLowerCase();

    // If it looks like an address and not in our list, try to find it on chain
    if (q.length === 42 && q.startsWith('0x')) {
       // Check if we have it locally first
       const localMatch = patients.find(p => p.id.toLowerCase() === q);
       if (localMatch) return [localMatch];

       // Otherwise check on-chain
       const contract = await getContract();
       const isPatientObj = await contract.patients(q);
       if (isPatientObj.isRegistered) {
          const profile = await contract.getPatientProfile(q);
          return [{
            id: q,
            name: profile.name || ("New Discovery (" + q.slice(0, 6) + ")"),
            status: "Active",
            primaryCondition: "On-Chain Record",
            bloodType: profile.bloodType,
            phone: profile.phone,
            email: profile.email
          }];
       }
       return [];
    }

    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
    );
  }, [patients]);

  const getPatientById = useCallback((id) => {
    return patients.find(p => p.id.toLowerCase() === id.toLowerCase());
  }, [patients]);

  // Sync offline localStorage states (pending) with actual on-chain truth
  const refreshConsents = useCallback(async () => {
    if (!patients.length || !user?.address) return;
    
    let hasChanges = false;
    const { checkConsentState } = await import('../blockchain/consent');
    const { getProvider } = await import('../blockchain/client');
    const signer = await getProvider().getSigner();
    const doctorAddress = await signer.getAddress();

    const updatedPatients = await Promise.all(patients.map(async (p) => {
       // Only perform network hits for those still pending (or we could always check if revoked)
       const { isGranted, isPending } = await checkConsentState(p.id, doctorAddress);
       
       let newStatus = p.consentStatus;
       if (isGranted) newStatus = 'granted';
       else if (isPending) newStatus = 'pending';
       else newStatus = 'revoked'; // If it's neither, they revoked or it failed

       if (newStatus !== p.consentStatus) {
           hasChanges = true;
           return { ...p, consentStatus: newStatus };
       }
       return p;
    }));

    if (hasChanges) {
        setPatients(updatedPatients);
        saveToCache(updatedPatients);
    }
  }, [patients, user, storageKey, getLastKnownPatientMetadata]);

  // Run a quick background refresh when the hook mounts
  useEffect(() => {
     refreshConsents();
  }, [user?.address]); // Dependency on login

  // Scan blockchain for all patients this doctor has ever added visits for
  const syncPatientsFromHistory = useCallback(async () => {
    if (!user?.address) return { ok: false, message: "No user logged in." };
    
    try {
      const contract = await getContract();

      // 1) Patients with recorded visits by this doctor
      const visitFilter = contract.filters.VisitAdded(null, user.address);
      const visitEvents = await contract.queryFilter(visitFilter, 0, "latest");

      // 2) Patients who granted consent to this doctor (even with zero visits yet)
      const consentFilter = contract.filters.ConsentGranted(null, user.address);
      const consentEvents = await contract.queryFilter(consentFilter, 0, "latest");

      const uniquePatients = [...new Set([
        ...visitEvents.map(e => e.args.patient.toLowerCase()),
        ...consentEvents.map(e => e.args.patient.toLowerCase())
      ])];

      if (uniquePatients.length === 0) {
        return { ok: true, message: "No linked patients found on-chain." };
      }

      // Filter out patients we already have locally
      const existingIds = new Set(patients.map(p => p.id.toLowerCase()));
      const newPatientIds = uniquePatients.filter(id => !existingIds.has(id));

      if (newPatientIds.length === 0) {
        return { ok: true, message: "Your directory is already up to date." };
      }

      // Fetch profiles for the new patients found
      const recoveredPatients = await Promise.all(newPatientIds.map(async (addr) => {
        try {
          const profile = await contract.getPatientProfile(addr);
          const { checkConsentState } = await import('../blockchain/consent');
          const { isGranted } = await checkConsentState(addr, user.address);

          const onChainMetadata = await readOnChainDirectoryMetadata(contract, addr);
          const lastKnown = getLastKnownPatientMetadata(addr);

          return {
            id: addr,
            name: profile.name || ("Recovered Patient " + addr.slice(0, 6)),
            status: onChainMetadata?.status || lastKnown?.status || "Active",
            primaryCondition: onChainMetadata?.primaryCondition || lastKnown?.primaryCondition || "Clinical Record",
            bloodType: profile.bloodType || "Unknown",
            phone: profile.phone || "N/A",
            email: profile.email || "N/A",
            consentStatus: isGranted ? 'granted' : 'pending'
          };
        } catch (e) {
          console.error(`Failed to recover profile for ${addr}:`, e);
          return null;
        }
      }));

      const finalRecovered = recoveredPatients.filter(p => p !== null);
      
      if (finalRecovered.length > 0) {
        setPatients(prev => {
          const updated = [...prev, ...finalRecovered];
          saveToCache(updated);
          return updated;
        });
        return { ok: true, count: finalRecovered.length };
      }

      return { ok: true, count: 0 };
    } catch (error) {
      console.error("Directory sync failed:", error);
      return { ok: false, message: error.message };
    }
  }, [patients, user, storageKey, getLastKnownPatientMetadata, readOnChainDirectoryMetadata]);

  return { 
    patients, 
    searchPatients, 
    addPatient: addPatientByAddress, 
    getPatientById, 
    refreshConsents,
    syncPatientsFromHistory
  }
}
