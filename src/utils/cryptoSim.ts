/**
 * Utility functions for simulated ODPC Cryptographic Partitioning,
 * SHA-256 identity fingerprinting, and Kenyan statutory validations.
 */

// Simple deterministic hash simulation for tenant email/phone
export function generateSha256Fingerprint(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  const hex1 = Math.abs(hash).toString(16).padStart(8, '0');
  
  // Create a realistic 64-character SHA-256 hex string
  let fullHex = '';
  for (let i = 0; i < 8; i++) {
    const seed = (hash ^ (i * 0x5bd1e995)) >>> 0;
    fullHex += seed.toString(16).padStart(8, '0');
  }
  return fullHex.slice(0, 64);
}

// Simulated AES-256-GCM payload generator
export function generateAesPayload(email: string, phone: string): string {
  const iv = Math.random().toString(16).substring(2, 10);
  const authTag = Math.random().toString(16).substring(2, 10);
  const cipher = btoa(`${email}::${phone}`).replace(/=/g, '').toLowerCase().slice(0, 24);
  return `aes-256-gcm:iv=${iv}:auth=${authTag}:cipher=${cipher}`;
}

// Generate realistic tenant pseudonym
export function generatePseudonym(estateOrCounty = 'Kenya'): string {
  const cleanPrefix = estateOrCounty.replace(/[^a-zA-Z]/g, '') || 'Tenant';
  const suffixes = ['Renter', 'Tenant', 'Resident', 'Dweller', 'Citizen'];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  const randomNum = Math.floor(10 + Math.random() * 89);
  return `${cleanPrefix}${suffix}${randomNum}`;
}

// Validate Kenya Police Occurrence Book (OB) Number:
// e.g. "OB 42/02/09/2026" or "OB 114/08/2026"
export function validateKenyaPoliceOb(ob: string): boolean {
  const trimmed = ob.trim();
  const obRegex = /^OB\s+\d{1,4}\/\d{1,2}(?:\/\d{1,2})?\/\d{4}$/i;
  return obRegex.test(trimmed);
}

// Validate Estate Agents Registration Board (EARB) license:
// e.g. "EARB/A/3819" or "EARB/B/1209"
export function validateEarbLicense(earb: string): boolean {
  const trimmed = earb.trim();
  const earbRegex = /^EARB\/[A-Z]\/\d{3,6}$/i;
  return earbRegex.test(trimmed);
}

// Validate Safaricom M-Pesa 10-character transaction receipt code:
// e.g. "SAB89412KL" or "QRT4XYZ7AB"
export function validateMpesaCode(code: string): boolean {
  const trimmed = code.trim().toUpperCase();
  const mpesaRegex = /^[A-Z0-9]{10}$/;
  return mpesaRegex.test(trimmed);
}
