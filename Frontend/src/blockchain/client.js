import { ethers } from 'ethers';
import HealthRecords from './HealthRecords.json';

/**
 * Dynamically retrieves the contract address based on the current network ID.
 * Strictly checks that the network is defined in the artifact.
 */
export async function getContractAddress(provider) {
  const networks = HealthRecords.networks;
  const networkIds = Object.keys(networks);

  if (networkIds.length === 0) {
    throw new Error('No deployed contract found in HealthRecords.json. Did you run truffle migrate?');
  }

  // Get current network from provider
  const network = await provider.getNetwork();
  const chainId = network.chainId.toString();

  if (networks[chainId]) {
    return networks[chainId].address;
  }

  throw new Error(`Contract not found for Chain ID ${chainId}. Please ensure you have migrated to this network.`);
}

export function getProvider() {
  if (window.ethereum) return new ethers.BrowserProvider(window.ethereum);
  return new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL || 'http://127.0.0.1:7545');
}

export async function getContract(withSigner = false) {
  const provider = getProvider();
  const address = await getContractAddress(provider);

  // Added: Verify that code exists at the address to prevent silent failures
  const code = await provider.getCode(address);
  if (code === '0x' || code === '0x0') {
    throw new Error(`No contract found at address ${address} on the current network.`);
  }
  
  if (withSigner) {
    if (!window.ethereum) {
      throw new Error("MetaMask is required to sign transactions.");
    }
    const signer = await provider.getSigner();
    return new ethers.Contract(address, HealthRecords.abi, signer);
  }
  
  return new ethers.Contract(address, HealthRecords.abi, provider);
}
