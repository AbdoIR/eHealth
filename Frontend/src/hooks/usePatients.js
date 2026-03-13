import { useState, useCallback } from 'react'
import { getContract } from '../blockchain/client'

const STORAGE_KEY = 'hc_patients_v2'

function loadCachedPatients() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function usePatients() {
  const [patients, setPatients] = useState(loadCachedPatients)

  const saveToCache = (updated) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  const addPatientByAddress = useCallback(async (address, metadata = {}) => {
    try {
      const contract = await getContract();
      const isRegistered = await contract.isPatient(address);
      
      if (!isRegistered) {
        return { ok: false, message: "This address is not registered as a patient on the blockchain." };
      }

      // Check if already in list
      const normalizedAddr = address.toLowerCase();
      const existing = patients.find(p => p.id.toLowerCase() === normalizedAddr);
      if (existing) {
        return { ok: false, message: "This patient is already in your directory." };
      }

      // ENFORCEMENT: Trigger on-chain consent request
      const { requestPatientConsent } = await import('../blockchain/consent');
      await requestPatientConsent(address);

      const newPatient = {
        id: normalizedAddr,
        name: metadata.name || ("Patient " + address.slice(0, 6)),
        status: metadata.status || "Active",
        primaryCondition: metadata.condition || "Clinical Record",
        gender: metadata.gender || "Unknown",
        dob: metadata.dob || "Unknown",
        bloodType: "Unknown",
        phone: "N/A",
        email: address.slice(0, 8) + "@eth.mail",
        consentStatus: 'pending' // Locally track that we just requested it
      };

      setPatients(prev => {
        const updated = [...prev, newPatient];
        saveToCache(updated);
        return updated;
      });

      return { ok: true, patient: newPatient };
    } catch (error) {
      console.error("Failed to add patient (consent request failed):", error);
      const msg = error.reason || error.message || "Failed to broadcast consent request to blockchain.";
      return { ok: false, message: msg };
    }
  }, [patients]);

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
       const isRegistered = await contract.isPatient(q);
       if (isRegistered) {
          return [{
            id: q,
            name: "New Discovery (" + q.slice(0, 6) + ")",
            status: "Active",
            primaryCondition: "On-Chain Record"
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

  const removePatient = useCallback((address) => {
    setPatients(prev => {
      const updated = prev.filter(p => p.id.toLowerCase() !== address.toLowerCase());
      saveToCache(updated);
      return updated;
    });
  }, []);

  return { patients, searchPatients, addPatient: addPatientByAddress, removePatient, getPatientById }
}
