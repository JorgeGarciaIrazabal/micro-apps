// Browser-side decryption using the Web Crypto API.
// Mirrors scripts/encrypt-data.mjs: PBKDF2-SHA256 → AES-256-GCM.
// The password is entered by the viewer at runtime and is never shipped in the
// bundle — only the ciphertext (encrypted-data.json) is.

function b64ToBytes(b64) {
  const bin = atob(b64)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
  return arr
}

export async function decryptData(password, blob) {
  const subtle = crypto.subtle
  const salt = b64ToBytes(blob.salt)
  const iv = b64ToBytes(blob.iv)
  const ct = b64ToBytes(blob.ct) // ciphertext with the 128-bit GCM tag appended

  const keyMaterial = await subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  const key = await subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: blob.iterations, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt'],
  )
  // Throws OperationError if the password is wrong (auth tag mismatch).
  const plainBuf = await subtle.decrypt({ name: 'AES-GCM', iv }, key, ct)
  return JSON.parse(new TextDecoder().decode(plainBuf))
}
