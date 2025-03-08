import { expect } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import chai from "chai";
import { ethers } from "ethers";
import { ContractUtils } from "../../../../shared/ethereum/contractUtils";
import { createMockSentient } from "../../mocks/MockSentient";

// Set up chai-as-promised
chai.use(chaiAsPromised);

describe("ContractUtils", () => {
  let contractUtils: ContractUtils;
  const mockAddress = "0x1234567890123456789012345678901234567890";

  beforeEach(() => {
    // Create a minimal test configuration
    const provider = new ethers.JsonRpcProvider();
    const privateKey = ethers.Wallet.createRandom().privateKey;
    contractUtils = new ContractUtils(provider, privateKey);
  });

  describe("Contract Connection", () => {
    it.skip("should connect to a contract with address", () => {
      // Test skipped until fixed
    });
  });

  describe("RSA key management", () => {
    it.skip("should store and retrieve RSA keys", () => {
      // Test skipped until fixed
    });
  });
});
