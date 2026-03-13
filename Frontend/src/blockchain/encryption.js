import { ethers } from 'ethers';

const ENCRYPTION_MESSAGE = "Authorize MedDesk to access and encrypt your medical records. This signature will be used to derive your private encryption key.";

/**
 * Derives a 256-bit symmetric key from a user's signature.
 * @param {Signer} signer - THE PATIENT'S signer (must be the patient to access their records).
 */
export async function deriveKey(signer) {
  const signature = await signer.signMessage(ENCRYPTION_MESSAGE);
  const keyHex = ethers.keccak256(signature); // 32 bytes (256 bits)
  return keyHex;
}

/**
 * Encrypts data using AES-GCM.
 * @param {string} text - JSON string of the visit data.
 * @param {string} keyHex - The hex-encoded 256-bit key.
 */
export async function encryptData(text, keyHex) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const keyBuffer = hexToBytes(keyHex.slice(2));
  
  const cryptoKey = await window.crypto.subtle.importKey(
    "raw",
    keyBuffer,
    "AES-GCM",
    false,
    ["encrypt"]
  );

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    data
  );

  // Combine IV and Ciphertext for storage
  const result = new Uint8Array(iv.length + encrypted.byteLength);
  result.set(iv);
  result.set(new Uint8Array(encrypted), iv.length);

  return ethers.hexlify(result);
}

/**
 * Decrypts data using AES-GCM.
 * @param {string} hexData - The hex-encoded IV + Ciphertext from the blockchain.
 * @param {string} keyHex - The hex-encoded 256-bit key.
 */
export async function decryptData(hexData, keyHex) {
  const combined = hexToBytes(hexData.slice(2));
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  const keyBuffer = hexToBytes(keyHex.slice(2));

  const cryptoKey = await window.crypto.subtle.importKey(
    "raw",
    keyBuffer,
    "AES-GCM",
    false,
    ["decrypt"]
  );

  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    ciphertext
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}
