import { createContext, useContext, useState, useEffect } from 'react'
import { getContract, getProvider, requestSwitchToSepolia, requestSwitchToGanache } from '../blockchain/client'
import { deriveKey as blockchainDeriveKey } from '../blockchain/encryption'

const USER_STORAGE_KEY = 'hc_user'         // currently signed-in user
const ENC_KEY_PREFIX = 'hc_ekey_'          // persistent encryption keys
const NETWORK_STORAGE_KEY = 'hc_network'   // preferred network

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadJSON(USER_STORAGE_KEY, null))
  const [targetNetwork, setTargetNetwork] = useState(() => localStorage.getItem(NETWORK_STORAGE_KEY) || 'sepolia')
  const [encryptionKey, setEncryptionKey] = useState(() => {
    if (user?.address) return localStorage.getItem(ENC_KEY_PREFIX + user.address.toLowerCase())
    return null
  })

  // Persist network preference
  useEffect(() => {
    localStorage.setItem(NETWORK_STORAGE_KEY, targetNetwork)
  }, [targetNetwork])

  // Utility to handle account and network changes in MetaMask
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          logout() // User disconnected wallet
        } else if (user && accounts[0].toLowerCase() !== user.address.toLowerCase()) {
          logout() // User switched accounts, force them to log in again
        }
      }

      const handleChainChanged = () => {
        // Standard practice: reload the page on chain change
        window.location.reload()
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [user])

  // Verify cached user on startup against blockchain
  useEffect(() => {
    async function verifyUser() {
      if (user) {
        try {
          const contract = await getContract(false);
          const isDocObj = await contract.doctors(user.address);
          const isPatObj = await contract.patients(user.address);
          
          if (!isDocObj.isRegistered && !isPatObj.isRegistered) {
            logout();
          }
        } catch (e) {
          // If we can't talk to the contract (e.g. network switch), 
          // we don't logout immediately to avoid kicking the user out 
          // during temporary RPC flicker.
          console.warn("Startup verification deferred:", e.message);
        }
      }
    }
    verifyUser();
  }, [])

  async function login() {
    if (!window.ethereum) return { ok: false, message: 'MetaMask is not installed.' }

    try {
      const provider = getProvider()
      const network = await provider.getNetwork()
      const chainId = network.chainId.toString()

      // Check if we need to switch network before logging in
      if (targetNetwork === 'sepolia' && chainId !== '11155111') {
        await requestSwitchToSepolia()
        return { ok: false, message: 'Switching to Sepolia... Please try connecting again.' }
      } else if (targetNetwork === 'ganache' && chainId !== '1337') {
        await requestSwitchToGanache()
        return { ok: false, message: 'Switching to Ganache... Please try connecting again.' }
      }

      const accounts = await provider.send("eth_requestAccounts", [])
      const address = accounts[0].toLowerCase()

      const contract = await getContract(false)
      
      const isDoctorObj = await contract.doctors(address)
      const isPatientObj = await contract.patients(address)
      
      const isDoctor = isDoctorObj.isRegistered
      const isPatient = isPatientObj.isRegistered
      
      if (isDoctor || isPatient) {
        let name = ''
        let email = address.slice(0, 10) + '@meddesk.eth'
        let bloodType = ''
        let phone = ''
        let clinic = ''
        let timezone = 'America/New_York'
        let workingHoursStart = '08:00'
        let workingHoursEnd = '18:00'

        if (isDoctor) {
           const docStruct = await contract.doctors(address)
           name = docStruct.name
           clinic = docStruct.clinic
           timezone = docStruct.timezone
           workingHoursStart = docStruct.workingHoursStart
           workingHoursEnd = docStruct.workingHoursEnd
        } else {
           const profile = await contract.getPatientProfile(address)
           name = profile.name
           bloodType = profile.bloodType
           phone = profile.phone
           email = profile.email || email
        }

        const userType = isDoctor ? 'doctor' : 'patient'
        const safeUser = {
          id: address, 
          address,
          userType,
          name: name || (isDoctor ? 'Doctor ' + address.slice(0, 6) : 'Patient ' + address.slice(0, 6)),
          role: isDoctor ? 'Authorized Doctor' : 'Registered Patient',
          email,
          bloodType,
          phone,
          clinic,
          timezone,
          workingHoursStart,
          workingHoursEnd
        }
        saveJSON(USER_STORAGE_KEY, safeUser)
        setUser(safeUser)
        return { ok: true, userType }
      }

      return { ok: false, message: 'Address not registered. Please register first.' }
    } catch (error) {
       console.error('Login error:', error)
       const msg = error.message || 'Failed to connect wallet.'
       return { ok: false, message: msg }
    }
  }

  async function register({ 
    userType, 
    doctorAddress, 
    name = '', 
    bloodType = '', 
    phone = '', 
    email = '',
    clinic = '',
    timezone = '',
    workingHoursStart = '',
    workingHoursEnd = '' 
  }) {
    if (!window.ethereum) return { ok: false, message: 'MetaMask is not installed.' }

    try {
      const provider = getProvider()
      const accounts = await provider.send("eth_requestAccounts", [])
      const address = accounts[0]

      const contract = await getContract(true) // Requires signer to transact
      
      if (userType === 'doctor') {
        const owner = await contract.owner()
        if (address.toLowerCase() !== owner.toLowerCase()) {
           return { ok: false, message: 'Only the clinic admin (contract owner) can authorize new doctors.' }
        }
        if (!doctorAddress || doctorAddress.length !== 42) {
           return { ok: false, message: 'Please provide a valid Ethereum address for the doctor.' }
        }
        if (!name.trim()) return { ok: false, message: 'Doctor name is required.' }
        if (!clinic.trim()) return { ok: false, message: 'Clinic Name is required.' }
        
        const isDocObj = await contract.doctors(doctorAddress)
        if (isDocObj.isRegistered) return { ok: false, message: 'This address is already an authorized doctor.' }

        const tx = await contract.addDoctor(
           doctorAddress, 
           name, 
           clinic, 
           timezone, 
           workingHoursStart, 
           workingHoursEnd
        )
        await tx.wait()

        return { ok: true }
      }

      const isDocObj = await contract.doctors(address)
      if (isDocObj.isRegistered) return { ok: false, message: 'This address is already an authorized doctor.' }

      if (!name.trim()) return { ok: false, message: 'Patient name is required.' }

      const tx = await contract.registerPatient(name, bloodType, phone, email)
      await tx.wait() // Wait for block confirmation

      // Auto-login upon successful registration
      return login()
      
    } catch (error) {
      console.error(error)
      const msg = error.reason || error.message || 'Registration transaction failed.'
      return { ok: false, message: msg }
    }
  }

  /**
   * Returns the cached encryption key or requests a signature if not present.
   */
  async function getEncryptionKey(patientAddress = null) {
    // If a patient address is provided, we return the deterministic key for that patient
    if (patientAddress) {
      const { derivePatientKey } = await import('../blockchain/encryption');
      return derivePatientKey(patientAddress);
    }

    if (encryptionKey) return encryptionKey;

    try {
      const provider = getProvider();
      const signer = await provider.getSigner();
      const derived = await blockchainDeriveKey(signer);
      
      // Persist the key for this machine/address
      if (user?.address) {
        localStorage.setItem(ENC_KEY_PREFIX + user.address.toLowerCase(), derived);
      }
      
      setEncryptionKey(derived);
      return derived;
    } catch (error) {
      console.error("Failed to derive encryption key:", error);
      throw error;
    }
  }

  function logout() {
    if (user?.address) {
       localStorage.removeItem(ENC_KEY_PREFIX + user.address.toLowerCase())
    }
    localStorage.removeItem(USER_STORAGE_KEY)
    setUser(null)
    setEncryptionKey(null)
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      getEncryptionKey, 
      isAuthenticated: !!user,
      targetNetwork,
      setTargetNetwork
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
