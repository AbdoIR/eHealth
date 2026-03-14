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
      
      const count = await contract.getVisitCount(patientAddress);
      const rawVisits = await contract.getHistory(patientAddress, 0, count);

      // Cache for doctor names to avoid redundant calls
      const doctorCache = {};

      const decryptedVisits = await Promise.all(rawVisits.map(async (v) => {
        try {
          const decryptedJson = await decryptData(v.encryptedData, keyHex);
          const data = JSON.parse(decryptedJson);

          // Fetch doctor name if not in cache
          const docAddr = v.doctor.toLowerCase();
          if (!doctorCache[docAddr]) {
            try {
              doctorCache[docAddr] = await contract.getDoctorProfile(v.doctor);
            } catch (e) {
              doctorCache[docAddr] = `Dr. ${v.doctor.slice(0, 6)}`;
            }
          }

          return {
            ...data,
            doctor: v.doctor,
            doctorName: doctorCache[docAddr],
            timestamp: Number(v.timestamp) * 1000,
            date: new Date(Number(v.timestamp) * 1000).toISOString().split('T')[0]
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
