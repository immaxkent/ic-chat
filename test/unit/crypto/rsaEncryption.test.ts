import { expect } from "chai";
import {
  generateRsaKeyPair,
  encryptWithRSA,
  decryptWithRSA,
  saveRsaKeysToFiles,
  loadRsaKeysFromFiles,
} from "../../../shared/crypto/rsaEncryption";
import * as fs from "fs";
import * as dotenv from "dotenv";
import { getValidPrivateKey } from "../../helpers/testUtils";

// Load environment variables
dotenv.config();

// Get a valid private key for testing
const privateKey = getValidPrivateKey(
  process.env.PRIVATE_KEY || process.env.TEST_PRIVATE_KEY
);

// Clean up any existing test key files
before(() => {
  try {
    fs.unlinkSync("./test-public.pem");
  } catch (e) {}
  try {
    fs.unlinkSync("./test-private.pem");
  } catch (e) {}
});

after(() => {
  try {
    fs.unlinkSync("./test-public.pem");
  } catch (e) {}
  try {
    fs.unlinkSync("./test-private.pem");
  } catch (e) {}
});

// Use function instead of arrow function to properly bind 'this'
describe("RSA Encryption (New Structure)", function () {
  // Now 'this' is properly bound to the Mocha context
  this.timeout(10000); // 10 seconds

  it("should generate a deterministic key pair from seed", function () {
    // This also works in individual test functions
    this.timeout(10000); // 10 seconds

    // Use the private key from environment or fall back to test value
    const seed = privateKey
      ? privateKey.startsWith("0x")
        ? privateKey.substring(2)
        : privateKey
      : "test-seed-value";

    const keyPair1 = generateRsaKeyPair(seed);
    const keyPair2 = generateRsaKeyPair(seed);

    expect(keyPair1.publicKey).to.equal(keyPair2.publicKey);
    expect(keyPair1.privateKey).to.equal(keyPair2.privateKey);
  });

  it("should encrypt and decrypt a message", function () {
    // Use the private key from environment or fall back to test value
    const seed = privateKey
      ? privateKey.startsWith("0x")
        ? privateKey.substring(2)
        : privateKey
      : "encryption-test-seed";

    const message = "This is a test message";
    const keyPair = generateRsaKeyPair(seed);

    const encrypted = encryptWithRSA(message, keyPair.publicKey);
    expect(encrypted).to.not.equal(message);

    const decrypted = decryptWithRSA(encrypted, keyPair.privateKey);
    expect(decrypted).to.equal(message);
  });

  it("should save and load RSA keys from files", function () {
    // Use the private key from environment or fall back to test value
    const seed = privateKey
      ? privateKey.startsWith("0x")
        ? privateKey.substring(2)
        : privateKey
      : "file-test-seed";

    const keyPair = generateRsaKeyPair(seed);

    // Save keys to test files
    saveRsaKeysToFiles(
      keyPair.publicKey,
      keyPair.privateKey,
      "./test-public.pem",
      "./test-private.pem"
    );

    // Load keys from files
    const loadedKeys = loadRsaKeysFromFiles(
      "./test-public.pem",
      "./test-private.pem"
    );

    expect(loadedKeys).to.not.be.null;
    expect(loadedKeys?.publicKey).to.equal(keyPair.publicKey);
    expect(loadedKeys?.privateKey).to.equal(keyPair.privateKey);
  });
});
