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
      const keyHex = await getEncryptionKey();
      
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
      const keyHex = await getEncryptionKey();
      
      const count = await contract.getVisitCount(patientAddress);
      const rawVisits = await contract.getHistory(patientAddress, 0, count);

      const decryptedVisits = await Promise.all(rawVisits.map(async (v) => {
        try {
          const decryptedJson = await decryptData(v.encryptedData, keyHex);
          const data = JSON.parse(decryptedJson);
          return {
            ...data,
            doctor: v.doctor,
            timestamp: Number(v.timestamp) * 1000,
            date: new Date(Number(v.timestamp) * 1000).toISOString().split('T')[0]
          };
        } catch (e) {
          console.warn("Failed to decrypt a visit - likely wrong key/signature:", e);
          return null; // Skip records we can't decrypt
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
