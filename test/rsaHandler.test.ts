import { generateRsaKeyPair } from "../shared/rsaEncryption";
import {
  prepareRSAKeyForContract,
  reconstructRSAPEMKey,
} from "../shared/rsaHandler";

describe("RSA Key Chunking for Smart Contracts", () => {
  jest.setTimeout(10000); // RSA operations might take some time

  test("should prepare keys from rsaEncryption module", async () => {
    // Generate a fresh key pair
    const keyPair = await generateRsaKeyPair();

    // Prepare the key for contract storage
    const chunks = prepareRSAKeyForContract(keyPair.publicKey);

    // Verify we have chunks
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks.length).toBeLessThanOrEqual(4);

    // Verify chunks format
    chunks.forEach((chunk) => {
      expect(chunk).toMatch(/^0x[0-9a-f]{64}$/i);
    });

    // now we mimic the behaviour of storing in a contract (4 bytes32 slots) and then reverting the format as if read from a contract call and reconstructing the key
    const reconstructedKey = reconstructRSAPEMKey(chunks);
    expect(reconstructedKey).toBe(keyPair.publicKey);
  });
});
