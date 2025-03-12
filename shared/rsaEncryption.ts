import * as forge from "node-forge";
import { ethers } from "ethers";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();

/**
 * Generate RSA key pair deterministically from Ethereum private key
 */
function generateRsaKeyPair(PrivKeyIdentifier?: number): {
  publicKey: string;
  privateKey: string;
} {
  // let ethPrivateKey = "";
  // removed use of ethereum private key since the key can be reverse engineered from two like signed messages, making it not secure
  // better to create and cache a prng on creation of the keys during set up, publishing this to
  // if (!PrivKeyIdentifier) {
  //   ethPrivateKey = process.env.PRIVATE_KEY || "defaultseed12345";
  //   if (!process.env.PRIVATE_KEY) {
  //     console.warn("Warning: Using default seed - not secure for production");
  //   }
  // } else {
  //   ethPrivateKey = process.env.PSEUDONYMOUS_PRIVATE_KEY || "defaultseed12345";
  // }
  // const seed = forge.util.createBuffer();
  const prng = forge.random.createInstance();
  // prng.seedFileSync = function (needed: number) {
  //   const hash = forge.md.sha256.create();
  //   let data = seed.data;
  //   while (seed.length() < needed) {
  //     hash.update(data);
  //     data = hash.digest().getBytes();
  //     seed.putBytes(data);
  //   }
  //   return seed.getBytes(needed);
  // };
  const keyPair = forge.pki.rsa.generateKeyPair({
    bits: 4096,
    prng: prng,
    workers: -1,
  });

  const publicKeyPem = forge.pki.publicKeyToPem(keyPair.publicKey);
  const privateKeyPem = forge.pki.privateKeyToPem(keyPair.privateKey);

  fs.writeFileSync("publicKey.pem", publicKeyPem);
  fs.writeFileSync("privateKey.pem", privateKeyPem);

  console.log("RSA key pair generated successfully from Ethereum key");
  return {
    publicKey: forge.pki.publicKeyToPem(keyPair.publicKey),
    privateKey: forge.pki.privateKeyToPem(keyPair.privateKey),
  };
}

function loadRsaKeyPair(): { publicKey: string; privateKey: string } {
  const publicKeyPem = fs.readFileSync("publicKey.pem", "utf8");
  const privateKeyPem = fs.readFileSync("privateKey.pem", "utf8");
  return {
    publicKey: publicKeyPem,
    privateKey: privateKeyPem,
  };
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
  // hence using PKCS#1 v1.5 padding scheme
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

export { generateRsaKeyPair, loadRsaKeyPair, encryptWithRSA, decryptWithRSA };
