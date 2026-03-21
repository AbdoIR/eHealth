import { ethers } from 'ethers';
import { gcm } from '@noble/ciphers/aes';
import { randomBytes } from '@noble/ciphers/webcrypto';

const ENCRYPTION_MESSAGE = "Authorize MedDesk to access and encrypt your medical records. This signature will be used to derive your private encryption key.";

// A deterministic salt used to derive per-patient keys.
const SYSTEM_SALT = "MedDesk_Shared_Clinical_Space_v1";

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
 * Derives a deterministic symmetric key for a specific patient's records.
 * Allows any authorized party (Doctor or Patient) to access the same encrypted space.
 */
export function derivePatientKey(patientAddress) {
  const input = patientAddress.toLowerCase() + SYSTEM_SALT;
  return ethers.keccak256(ethers.toUtf8Bytes(input));
}

/**
 * Encrypts data using AES-GCM (via @noble/ciphers — works in all contexts, HTTP or HTTPS).
 * @param {string} text - JSON string of the visit data.
 * @param {string} keyHex - The hex-encoded 256-bit key.
 */
export async function encryptData(text, keyHex) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const key = hexToBytes(keyHex.slice(2));   // 32-byte key
  const iv = randomBytes(12);                 // 12-byte random nonce

  const aes = gcm(key, iv);
  const encrypted = aes.encrypt(data);       // ciphertext + 16-byte auth tag appended

  // Combine IV and Ciphertext for storage (same format as before)
  const result = new Uint8Array(iv.length + encrypted.length);
  result.set(iv);
  result.set(encrypted, iv.length);

  return ethers.hexlify(result);
}

/**
 * Decrypts data using AES-GCM (via @noble/ciphers — works in all contexts, HTTP or HTTPS).
 * @param {string} hexData - The hex-encoded IV + Ciphertext from the blockchain.
 * @param {string} keyHex - The hex-encoded 256-bit key.
 */
export async function decryptData(hexData, keyHex) {
  const combined = hexToBytes(hexData.slice(2));
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  const key = hexToBytes(keyHex.slice(2));   // 32-byte key

  const aes = gcm(key, iv);
  const decrypted = aes.decrypt(ciphertext); // verifies auth tag & decrypts

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
