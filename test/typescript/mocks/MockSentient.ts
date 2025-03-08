import { ethers } from "ethers";

/**
 * Creates a simple mock Sentient contract for unit testing
 */
export function createMockSentient(
  address = "0x1234567890123456789012345678901234567890"
) {
  return {
    address,
    getData: async (key) => ethers.ZeroHash,
    pubEthToRsa: async (address) => "",
    pingRequest: async (key, signature) => ({
      hash: "0xmock",
      wait: async () => ({ status: 1 }),
    }),
    updateData: async (dataEntry) => ({
      hash: "0xmock",
      wait: async () => ({ status: 1 }),
    }),
    approveRequest: async (key) => ({
      hash: "0xmock",
      wait: async () => ({ status: 1 }),
    }),
    getAddress: async () => address,
    connect: (signer) => ({ ...this }),
  };
}
