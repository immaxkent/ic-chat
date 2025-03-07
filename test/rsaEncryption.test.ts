import {
  generateRsaKeyPair,
  loadRsaKeyPair,
  encryptWithRSA,
  decryptWithRSA,
} from "../client/rsaEncryption";

describe("RSA Encryption", () => {
  test("Should encrypt and decrypt a message successfully", () => {
    const keyPair = generateRsaKeyPair();
    const message = "This is a secret message that needs to be encrypted.";
    console.log("Generating message..." + message);

    console.log("Encrypting message...");
    const encrypted = encryptWithRSA(message, keyPair.publicKey);

    console.log("Decrypting message...");
    const decrypted = decryptWithRSA(encrypted, keyPair.privateKey);
    console.log("Decrypted message: " + decrypted);
    expect(decrypted).toBe(message);
  });

  test("Should encrypt and decrypt a message successfully with public and private keys stored on local file system", () => {
    const generated = loadRsaKeyPair(); //this stores the keys locally now

    const message = "This is a secret message that needs to be encrypted.";
    console.log("Generating message..." + message);

    console.log("Encrypting message...");
    const encrypted = encryptWithRSA(message, generated.publicKey);

    console.log("Decrypting message...");
    const decrypted = decryptWithRSA(encrypted, generated.privateKey);
    console.log("Decrypted message: " + decrypted);
    expect(decrypted).toBe(message);
  });

  test("Should revert if the message is not encrypted with the same public key", () => {
    const keyPair1 = generateRsaKeyPair();
    const keyPair2 = generateRsaKeyPair(42);

    const message = "This is a secret message that needs to be encrypted.";
    const encrypted = encryptWithRSA(message, keyPair2.publicKey);
    expect(() => {
      decryptWithRSA(encrypted, keyPair1.privateKey);
    }).toThrow();
  });
});
