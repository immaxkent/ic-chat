import {
  generateRsaKeyPair,
  encryptWithRSA,
  decryptWithRSA,
} from "../shared/crypto/rsaEncryption";
import * as dotenv from "dotenv";
import { ethers } from "ethers";

// Load environment variables
dotenv.config();

// Get private key from .env
let privateKey = process.env.PRIVATE_KEY;

// Validate the private key
try {
  if (privateKey) {
    // Check if it's a valid private key
    new ethers.Wallet(privateKey);
  } else {
    throw new Error("No PRIVATE_KEY found in .env file");
  }
} catch (error) {
  console.error("Error with private key:", error.message);
  console.log("Generating a random key for demonstration purposes...");
  privateKey = ethers.Wallet.createRandom().privateKey;
}

// Use the Ethereum private key as seed (without '0x' prefix if present)
const seed = privateKey.startsWith("0x") ? privateKey.substring(2) : privateKey;
console.log("Using Ethereum private key as seed for RSA key generation\n");

// Generate deterministic RSA keys from Ethereum key
const keyPair = generateRsaKeyPair(seed);
console.log("Generated RSA keys:");
console.log("Public key:", keyPair.publicKey.substring(0, 64) + "...");
console.log("Private key:", "[HIDDEN]");

const message = "Hello, secure world!";
console.log("\nOriginal message:", message);

const encrypted = encryptWithRSA(message, keyPair.publicKey);
console.log("\nEncrypted:", encrypted.substring(0, 64) + "...");

const decrypted = decryptWithRSA(encrypted, keyPair.privateKey);
console.log("\nDecrypted:", decrypted);
