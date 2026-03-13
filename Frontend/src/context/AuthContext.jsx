import { createContext, useContext, useState, useEffect } from 'react'
import { getContract, getProvider } from '../blockchain/client'
import { deriveKey as blockchainDeriveKey } from '../blockchain/encryption'

const USER_STORAGE_KEY = 'hc_user'         // currently signed-in user
const ENC_KEY_PREFIX = 'hc_ekey_'          // persistent encryption keys

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
  const [encryptionKey, setEncryptionKey] = useState(() => {
    if (user?.address) return localStorage.getItem(ENC_KEY_PREFIX + user.address.toLowerCase())
    return null
  })

  // Utility to handle account changes in MetaMask
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          logout() // User disconnected wallet
        } else if (user && accounts[0].toLowerCase() !== user.address.toLowerCase()) {
          logout() // User switched accounts, force them to log in again
        }
      }
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      return () => window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
    }
  }, [user])

  // Verify cached user on startup against blockchain
  useEffect(() => {
    async function verifyUser() {
      if (user) {
        try {
          const contract = await getContract(false);
          const isDoc = await contract.isDoctor(user.address);
          const isPat = await contract.isPatient(user.address);
          if (!isDoc && !isPat) {
            logout();
          }
        } catch (e) {
          // If we can't even talk to the contract, the session is untrusted
          logout();
        }
      }
    }
    verifyUser();
  }, [])

  async function login() {
    if (!window.ethereum) return { ok: false, message: 'MetaMask is not installed.' }

    try {
      const provider = getProvider()
      const accounts = await provider.send("eth_requestAccounts", [])
      const address = accounts[0].toLowerCase()

      const contract = await getContract(false)
      const isDoctor = await contract.isDoctor(address)
      const isPatient = await contract.isPatient(address)
      
      if (isDoctor || isPatient) {
        const userType = isDoctor ? 'doctor' : 'patient'
        const safeUser = {
          id: address, 
          address,
          userType,
          name: isDoctor ? 'Doctor ' + address.slice(0, 6) : 'Patient ' + address.slice(0, 6),
          role: isDoctor ? 'Authorized Doctor' : 'Registered Patient',
          email: address.slice(0, 10) + '@meddesk.eth',
          clinic: isDoctor ? 'Blockchain Network' : '',
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

  async function register({ userType, doctorAddress }) {
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
        
        const isDoc = await contract.isDoctor(doctorAddress)
        if (isDoc) return { ok: false, message: 'This address is already an authorized doctor.' }

        const tx = await contract.addDoctor(doctorAddress)
        await tx.wait()

        return { ok: true }
      }

      const isDoc = await contract.isDoctor(address)
      if (isDoc) return { ok: false, message: 'This address is already an authorized doctor.' }

      const tx = await contract.registerPatient()
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
  async function getEncryptionKey() {
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
    <AuthContext.Provider value={{ user, login, register, logout, getEncryptionKey, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
