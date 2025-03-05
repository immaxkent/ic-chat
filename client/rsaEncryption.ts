import forge from "node-forge";

/**
 * Generate RSA key pair deterministically from Ethereum private key
 */
function generateRsaKeyPair(): void {
  if (!this.wallet) {
    throw new Error("No wallet connected");
  }

  // Use Ethereum private key to seed a PRNG for deterministic key generation
  const ethPrivateKey = this.wallet.privateKey.slice(2);
  const seed = forge.util.createBuffer(ethPrivateKey);
  const prng = forge.random.createInstance();
  prng.seedFileSync = function (needed: number) {
    const hash = forge.md.sha256.create();
    let data = seed.data;
    while (seed.length() < needed) {
      hash.update(data);
      data = hash.digest().getBytes();
      seed.putBytes(data);
    }

    return seed.getBytes(needed);
  };
  console.log("Generating RSA key pair from Ethereum key...");
  const keyPair = forge.pki.rsa.generateKeyPair({
    bits: 2048,
    prng: prng,
    workers: -1,
  });

  this.rsaKeyPair = {
    publicKey: forge.pki.publicKeyToPem(keyPair.publicKey),
    privateKey: forge.pki.privateKeyToPem(keyPair.privateKey),
  };

  console.log("RSA key pair generated successfully from Ethereum key");
}

/**
 * Encrypts a message using RSA encryption with a public key.
 * @param message The message to encrypt
 * @param publicKeyPem The public key in PEM format
 * @returns Base64 encoded encrypted message
 */
function encryptWithRSA(message: string, publicKeyPem: string): string {
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  // RSA can only encrypt limited amount of data
  // hence sing PKCS#1 v1.5 padding scheme
  const encrypted = publicKey.encrypt(message, "RSA-OAEP", {
    md: forge.md.sha256.create(),
  });

  // Convert to base64 for easier storage/transmission
  return forge.util.encode64(encrypted);
}

/**
 * Decrypts an RSA encrypted message using a private key.
 * @param encryptedBase64 The encrypted message in base64 format
 * @param privateKeyPem The private key in PEM format
 * @returns The decrypted message
 */
function decryptWithRSA(
  encryptedBase64: string,
  privateKeyPem: string
): string {
  const encrypted = forge.util.decode64(encryptedBase64);
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

  // decrypt with same padding scheme
  return privateKey.decrypt(encrypted, "RSA-OAEP", {
    md: forge.md.sha256.create(),
  });
}

export { generateRsaKeyPair, encryptWithRSA, decryptWithRSA };
