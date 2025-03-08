import { expect } from "chai";
import { ethers } from "ethers";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import {
  generateRsaKeyPair,
  encryptWithRSA,
  decryptWithRSA,
} from "../../../../shared/crypto/rsaEncryption";

// Load environment variables
dotenv.config();

describe("RSA Encryption", () => {
  // Get private key from environment or use fallback for tests
  let privateKey: string;

  before(() => {
    // Try to get private key from environment
    privateKey = process.env.PRIVATE_KEY || "";

    // If no key in environment, try to read from .env file directly
    if (!privateKey) {
      try {
        const envPath = path.resolve(process.cwd(), ".env");
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, "utf8");
          const match = envContent.match(/PRIVATE_KEY=([0-9a-fA-Fx]+)/);
          if (match && match[1]) {
            privateKey = match[1].startsWith("0x") ? match[1] : `0x${match[1]}`;
          }
        }
      } catch (e) {
        console.warn("Could not read .env file:", e);
      }
    }

    // If still no key, use a test key
    if (!privateKey) {
      privateKey =
        "0x1234567890123456789012345678901234567890123456789012345678901234";
      console.warn(
        "Using test private key. For accurate testing, set PRIVATE_KEY in .env"
      );
    }
  });

  it("should generate key pairs", () => {
    const seed = "test-seed";
    const keyPair = generateRsaKeyPair(seed);

    expect(keyPair.publicKey).to.be.a("string");
    expect(keyPair.privateKey).to.be.a("string");
  });

  it("should generate deterministic keys from environment private key", () => {
    // Create a wallet with the private key
    const wallet = new ethers.Wallet(privateKey);

    // Generate RSA keys using the private key as seed (strip 0x prefix)
    const seed = privateKey.startsWith("0x") ? privateKey.slice(2) : privateKey;
    const keyPair1 = generateRsaKeyPair(seed);
    const keyPair2 = generateRsaKeyPair(seed);

    // Keys should be deterministic (same for the same seed)
    expect(keyPair1.publicKey).to.equal(keyPair2.publicKey);
    expect(keyPair1.privateKey).to.equal(keyPair2.privateKey);

    // Log wallet address for verification
    console.log(`Generated RSA keys for wallet: ${wallet.address}`);
  });

  it("should encrypt and decrypt data correctly", () => {
    // Use real private key for this test
    const seed = privateKey.startsWith("0x") ? privateKey.slice(2) : privateKey;
    const keyPair = generateRsaKeyPair(seed);
    const originalData = "test message";

    const encrypted = encryptWithRSA(originalData, keyPair.publicKey);
    const decrypted = decryptWithRSA(encrypted, keyPair.privateKey);

    expect(decrypted).to.equal(originalData);
  });
});

describe("RSA Key Generation", () => {
  it("should generate consistent keys from the same seed", () => {
    // Use a fixed seed for testing
    const seed = "fixed-test-seed-for-deterministic-generation";

    // Generate two key pairs with the same seed
    const keyPair1 = generateRsaKeyPair(seed);
    const keyPair2 = generateRsaKeyPair(seed);

    // Keys should be deterministic (same for the same seed)
    expect(keyPair1.publicKey).to.equal(keyPair2.publicKey);
    expect(keyPair1.privateKey).to.equal(keyPair2.privateKey);
  });

  it("should generate different keys from different seeds", () => {
    const seed1 = "test-seed-1";
    const seed2 = "test-seed-2";

    const keyPair1 = generateRsaKeyPair(seed1);
    const keyPair2 = generateRsaKeyPair(seed2);

    // Should produce different keys
    expect(keyPair1.publicKey).to.not.equal(keyPair2.publicKey);
    expect(keyPair1.privateKey).to.not.equal(keyPair2.privateKey);
  });

  it("should generate working RSA key pairs from wallet private key", () => {
    // Create a test wallet with a deterministic private key
    const wallet = ethers.Wallet.createRandom();

    // Extract the private key (strip 0x prefix if present)
    const privateKeySeed = wallet.privateKey.startsWith("0x")
      ? wallet.privateKey.slice(2)
      : wallet.privateKey;

    // Generate RSA keys using the private key as seed
    const keyPair = generateRsaKeyPair(privateKeySeed);

    // Verify keys are strings with expected format
    expect(keyPair.publicKey).to.be.a("string");
    expect(keyPair.privateKey).to.be.a("string");
    expect(keyPair.publicKey).to.include("-----BEGIN PUBLIC KEY-----");
    expect(keyPair.privateKey).to.include("-----BEGIN PRIVATE KEY-----");

    // Test encryption and decryption using the generated keys
    const testMessage = `Test message for wallet ${wallet.address}`;
    const encrypted = encryptWithRSA(testMessage, keyPair.publicKey);
    const decrypted = decryptWithRSA(encrypted, keyPair.privateKey);

    expect(decrypted).to.equal(testMessage);

    console.log(
      `Verified RSA key generation and encryption for wallet: ${wallet.address}`
    );
  });

  it("should always generate deterministic keys even with new wallet objects", () => {
    // Create a specific private key
    const privateKeyHex =
      "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

    // Create two wallet instances with the same private key
    const wallet1 = new ethers.Wallet(privateKeyHex);
    const wallet2 = new ethers.Wallet(privateKeyHex);

    // Extract seeds
    const seed1 = wallet1.privateKey.slice(2);
    const seed2 = wallet2.privateKey.slice(2);

    // Generate RSA keys
    const keyPair1 = generateRsaKeyPair(seed1);
    const keyPair2 = generateRsaKeyPair(seed2);

    // Keys should be identical
    expect(keyPair1.publicKey).to.equal(keyPair2.publicKey);
    expect(keyPair1.privateKey).to.equal(keyPair2.privateKey);
  });
});
