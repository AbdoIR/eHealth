import { ethers } from 'ethers';
import TruffleArtifact from './HealthRecords.json';
import RemixArtifact from './RemixArtifact.json';

const SEPOLIA_CHAIN_ID = 11155111; // Sepolia Testnet (Number for bigint comparison)
const SEPOLIA_CONTRACT_ADDRESS = "0x19a464fDc72875f9934De593D478e5e8B12D5df1";

// Helper to gracefully extract ABI regardless of Truffle vs Remix formats
function getAbi(chainId) {
  const isSepolia = chainId.toString() === SEPOLIA_CHAIN_ID.toString();
  
  if (isSepolia) {
    return RemixArtifact.abi || RemixArtifact;
  }
  return TruffleArtifact.abi;
}

/**
 * Dynamically retrieves the contract address based on the current network ID.
 */
export async function getContractAddress(provider) {
  // Use a direct RPC call to get the most up-to-date chain ID
  let chainIdHex;
  try {
    chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
  } catch (e) {
    const network = await provider.getNetwork();
    chainIdHex = "0x" + network.chainId.toString(16);
  }
  
  const chainId = BigInt(chainIdHex);

  if (chainId === BigInt(SEPOLIA_CHAIN_ID)) {
    return SEPOLIA_CONTRACT_ADDRESS;
  }

  // Fallback to Truffle Artifact logic (Ganache)
  const networks = TruffleArtifact.networks || {};
  const chainIdStr = chainId.toString();
  
  if (networks[chainIdStr]) {
    return networks[chainIdStr].address;
  }

  throw new Error(`Contract not found for Chain ID ${chainIdStr}.`);
}

export function getProvider() {
  if (window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL || 'http://127.0.0.1:7545');
}

/**
 * Requests MetaMask to switch to the Sepolia network.
 */
export async function requestSwitchToSepolia() {
  if (!window.ethereum) return;
  const hexChainId = "0x" + SEPOLIA_CHAIN_ID.toString(16);
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: hexChainId }],
    });
    // Give browser a moment to sync
    await new Promise(resolve => setTimeout(resolve, 500));
    window.location.reload(); // Hard refresh is often necessary to reset provider state
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: hexChainId,
              chainName: 'Sepolia Test Network',
              nativeCurrency: { name: 'Sepolia ETH', symbol: 'SEP', decimals: 18 },
              rpcUrls: ['https://ethereum-sepolia-rpc.publicnode.com'],
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            },
          ],
        });
      } catch (addError) {
        console.error("Failed to add Sepolia network:", addError);
      }
    } else {
      console.error("Failed to switch network:", switchError);
    }
  }
}

/**
 * Requests MetaMask to switch to the Local Ganache network (1337).
 */
export async function requestSwitchToGanache() {
  if (!window.ethereum) return;
  const chainId = "1337";
  const hexChainId = "0x" + parseInt(chainId).toString(16);
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: hexChainId }],
    });
    await new Promise(resolve => setTimeout(resolve, 500));
    window.location.reload();
  } catch (switchError) {
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: hexChainId,
              chainName: 'Ganache Local',
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['http://127.0.0.1:7545'],
            },
          ],
        });
      } catch (addError) {
        console.error("Failed to add Ganache network:", addError);
      }
    } else {
      console.error("Failed to switch network:", switchError);
    }
  }
}

export async function getContract(withSigner = false) {
  const provider = getProvider();
  
  // 1. Force a check of the active network
  let chainIdHex;
  try {
    chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
  } catch (e) {
    const network = await provider.getNetwork();
    chainIdHex = "0x" + network.chainId.toString(16);
  }
  const chainId = BigInt(chainIdHex).toString();
  
  // 2. Resolve the address
  let address;
  try {
     address = await getContractAddress(provider);
  } catch (e) {
     console.warn("Contract address resolution failed:", e.message);
  }

  // 3. Verify connection / Bytecode
  try {
    if (!address) throw new Error("No contract address resolved.");
    
    // timeout the getCode call because if Ganache is closed, it hangs MetaMask for a long time
    const codePromise = provider.getCode(address);
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("RPC Timeout")), 3000));
    
    const code = await Promise.race([codePromise, timeoutPromise]);
    
    if (code === '0x' || code === '0x0') {
      throw new Error(`No contract found at ${address}.`);
    }
  } catch (error) {
    if (error.message.includes("Failed to fetch") || error.message.includes("could not coalesce error") || error.message.includes("RPC endpoint") || error.message.includes("RPC Timeout")) {
       if (chainId === "1337") {
         throw new Error("Local Ganache (1337) appears to be closed. Please start Ganache or switch to Sepolia.");
       }
       throw new Error("Connection lost. Please refresh the page or check your internet connection.");
    }
    throw error;
  }
  
  const abi = getAbi(chainId);
  
  if (withSigner) {
    if (!window.ethereum) {
      throw new Error("MetaMask is required to sign transactions.");
    }
    const signer = await provider.getSigner();
    return new ethers.Contract(address, abi, signer);
  }
  
  return new ethers.Contract(address, abi, provider);
}
