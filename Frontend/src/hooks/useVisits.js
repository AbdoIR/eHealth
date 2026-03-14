import { useState, useCallback } from 'react'
import { getContract, getProvider } from '../blockchain/client'
import { encryptData, decryptData } from '../blockchain/encryption'
import { useAuth } from '../context/AuthContext'
import { ethers } from 'ethers'

export function useVisits() {
  const [visits, setVisits] = useState([])
  const { getEncryptionKey } = useAuth()

  const addVisit = useCallback(async (patientAddress, visitObject) => {
    try {
      const contract = await getContract(true);
      const keyHex = await getEncryptionKey(patientAddress);
      
      const json = JSON.stringify(visitObject);
      const encrypted = await encryptData(json, keyHex);

      const tx = await contract.addVisit(patientAddress, encrypted);
      const receipt = await tx.wait();

      return { ok: true, txHash: receipt.hash };
    } catch (error) {
      console.error("Failed to add visit:", error);
      throw error;
    }
  }, [getEncryptionKey])

  const getVisitsByPatient = useCallback(async (patientAddress) => {
    try {
      const contract = await getContract(true);
      const keyHex = await getEncryptionKey(patientAddress);
      
      const filter = contract.filters.VisitAdded(patientAddress);
      const events = await contract.queryFilter(filter, 0, "latest");
      
      // Sort events newest first based on timestamp
      const sortedEvents = events.sort((a, b) => Number(b.args.timestamp) - Number(a.args.timestamp));

      // Cache for doctor names to avoid redundant calls
      const doctorCache = {};

      const decryptedVisits = await Promise.all(sortedEvents.map(async (v) => {
        try {
          const decryptedJson = await decryptData(v.args.encryptedData, keyHex);
          const data = JSON.parse(decryptedJson);

          // Fetch doctor name if not in cache
          const docAddr = v.args.doctor.toLowerCase();
          if (!doctorCache[docAddr]) {
            try {
              doctorCache[docAddr] = await contract.getDoctorProfile(v.args.doctor);
            } catch (e) {
              doctorCache[docAddr] = `Dr. ${v.args.doctor.slice(0, 6)}`;
            }
          }

          return {
            ...data,
            doctor: v.args.doctor,
            doctorName: doctorCache[docAddr],
            timestamp: Number(v.args.timestamp) * 1000,
            date: new Date(Number(v.args.timestamp) * 1000).toISOString().split('T')[0]
          };
        } catch (e) {
          console.warn("Failed to decrypt a visit - likely wrong key/signature:", e);
          return null;
        }
      }));

      return decryptedVisits.filter(v => v !== null);
    } catch (error) {
      console.error("Failed to fetch visits:", error);
      return [];
    }
  }, [getEncryptionKey])

  return { visits, addVisit, getVisitsByPatient }
}
