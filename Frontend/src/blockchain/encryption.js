import { ethers } from 'ethers';
import { gcm } from '@noble/ciphers/aes.js';
import { randomBytes } from '@noble/ciphers/utils.js';

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
 * Encrypts data using AES-256-GCM (pure JS via @noble/ciphers).
 * Works in ALL contexts — HTTP or HTTPS, any IP address — no crypto.subtle needed.
 * @param {string} text   - JSON string of the visit data.
 * @param {string} keyHex - The hex-encoded 256-bit key (0x-prefixed).
 */
export async function encryptData(text, keyHex) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const key = hexToBytes(keyHex.slice(2));  // strip 0x → 32-byte Uint8Array
  const iv  = randomBytes(12);              // 12-byte random nonce

  const aes       = gcm(key, iv);
  const encrypted = aes.encrypt(data);     // ciphertext + 16-byte auth tag

  // Store as: IV (12 bytes) || ciphertext+tag — same layout as original
  const result = new Uint8Array(iv.length + encrypted.length);
  result.set(iv);
  result.set(encrypted, iv.length);

  return ethers.hexlify(result);
}

/**
 * Decrypts data using AES-256-GCM (pure JS via @noble/ciphers).
 * Works in ALL contexts — HTTP or HTTPS, any IP address — no crypto.subtle needed.
 * @param {string} hexData - Hex-encoded IV + ciphertext+tag (0x-prefixed) from the blockchain.
 * @param {string} keyHex  - The hex-encoded 256-bit key (0x-prefixed).
 */
export async function decryptData(hexData, keyHex) {
  const combined  = hexToBytes(hexData.slice(2));
  const iv        = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  const key       = hexToBytes(keyHex.slice(2));  // strip 0x → 32-byte Uint8Array

  const aes       = gcm(key, iv);
  const decrypted = aes.decrypt(ciphertext);      // verifies auth tag, throws on tamper

  return new TextDecoder().decode(decrypted);
}

// ─── helpers ────────────────────────────────────────────────────────────────

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}
