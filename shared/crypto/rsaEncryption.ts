import * as forge from "node-forge";

/**
 * Platform-agnostic RSA encryption utilities
 * Contains functionality from the original client/rsaEncryption.ts
 */

/**
 * Generate RSA key pair deterministically from provided seed
 */
export function generateRsaKeyPair(seed: string): {
  publicKey: string;
  privateKey: string;
} {
  const buffer = forge.util.createBuffer(seed);
  const prng = forge.random.createInstance();

  prng.seedFileSync = function (needed: number) {
    const hash = forge.md.sha256.create();
    let data = buffer.data;
    while (buffer.length() < needed) {
      hash.update(data);
      data = hash.digest().getBytes();
      buffer.putBytes(data);
    }
    return buffer.getBytes(needed);
  };

  const keyPair = forge.pki.rsa.generateKeyPair({
    bits: 2048,
    prng: prng,
    workers: -1,
  });

  return {
    publicKey: forge.pki.publicKeyToPem(keyPair.publicKey),
    privateKey: forge.pki.privateKeyToPem(keyPair.privateKey),
  };
}

/**
 * Encrypt a message using RSA
 */
export function encryptWithRSA(message: string, publicKeyPem: string): string {
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  const encrypted = publicKey.encrypt(message, "RSA-OAEP", {
    md: forge.md.sha256.create(),
  });

  return forge.util.encode64(encrypted);
}

/**
 * Decrypt an RSA encrypted message
 */
export function decryptWithRSA(
  encryptedBase64: string,
  privateKeyPem: string
): string {
  const encrypted = forge.util.decode64(encryptedBase64);
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

  return privateKey.decrypt(encrypted, "RSA-OAEP", {
    md: forge.md.sha256.create(),
  });
}

/**
 * Save RSA keys to files (Node.js environment only)
 */
export function saveRsaKeysToFiles(
  publicKey: string,
  privateKey: string,
  publicKeyPath: string = "./publicKey.pem",
  privateKeyPath: string = "./privateKey.pem"
): void {
  if (typeof window === "undefined") {
    // Node.js environment
    const fs = require("fs");
    fs.writeFileSync(publicKeyPath, publicKey);
    fs.writeFileSync(privateKeyPath, privateKey);
  } else {
    console.warn("saveRsaKeysToFiles is only available in Node.js environment");
  }
}

/**
 * Load RSA keys from files (Node.js environment only)
 */
export function loadRsaKeysFromFiles(
  publicKeyPath: string = "./publicKey.pem",
  privateKeyPath: string = "./privateKey.pem"
): { publicKey: string; privateKey: string } | null {
  if (typeof window === "undefined") {
    try {
      // Node.js environment
      const fs = require("fs");
      const publicKey = fs.readFileSync(publicKeyPath, "utf8");
      const privateKey = fs.readFileSync(privateKeyPath, "utf8");
      return { publicKey, privateKey };
    } catch (error) {
      console.error("Error loading RSA keys from files:", error);
      return null;
    }
  } else {
    console.warn(
      "loadRsaKeysFromFiles is only available in Node.js environment"
    );
    return null;
  }
}
