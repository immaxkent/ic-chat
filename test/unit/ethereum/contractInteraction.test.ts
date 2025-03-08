import { expect } from "chai";
import { ethers } from "ethers";
import { ContractUtils } from "../../../shared/ethereum/contractUtils";
import { ContractInteraction } from "../../../shared/ethereum/contractInteraction";
import { SentientABI } from "../../helpers/testAbis";
import { generateRsaKeyPair } from "../../../shared/crypto/rsaEncryption";
import * as dotenv from "dotenv";
import { getValidPrivateKey } from "../../helpers/testUtils";
// Import the generated mock
import { createMockSentient } from "../../mocks/MockSentient";
import { loadContractAbi } from "../../../shared/contracts/abiLoader";
import { Sentient__factory } from "../../../typechain/factories/Sentient__factory";

// Load environment variables
dotenv.config();

// Get a valid private key for testing
const privateKey = getValidPrivateKey(
  process.env.PRIVATE_KEY || process.env.TEST_PRIVATE_KEY
);

describe("Contract Interaction (New Structure)", () => {
  let provider: ethers.JsonRpcProvider;
  let contractUtils: ContractUtils;
  let rsaManager: ContractUtils;
  let contractInteraction: ContractInteraction;
  let keyPair: { publicKey: string; privateKey: string };

  // Use env private key or generate one if not available
  const testEthPrivateKey =
    privateKey || ethers.Wallet.createRandom().privateKey;

  beforeEach(() => {
    // Set up test environment
    provider = new ethers.JsonRpcProvider("http://localhost:8545");

    // Initialize utilities with the Ethereum private key
    contractUtils = new ContractUtils(provider, testEthPrivateKey);
    rsaManager = new ContractUtils(provider, testEthPrivateKey);

    // Generate RSA keys deterministically using the same Ethereum private key
    // Strip '0x' prefix if present for consistent results
    const seedKey = testEthPrivateKey.startsWith("0x")
      ? testEthPrivateKey.substring(2)
      : testEthPrivateKey;

    // Generate RSA keys using Ethereum private key as seed
    keyPair = generateRsaKeyPair(seedKey);
    rsaManager.setRsaKeys(keyPair.publicKey, keyPair.privateKey);

    // Replace the mock with the generated one
    const mockContract = createMockSentient();
    contractUtils.setContract(mockContract);

    // Create contract interaction instance
    const sentientAbi = loadContractAbi("Sentient");
    contractInteraction = new ContractInteraction(
      contractUtils,
      rsaManager,
      sentientAbi,
      "0x1234567890123456789012345678901234567890"
    );
  });

  it("should register a public key", async () => {
    try {
      const tx = await contractInteraction.registerPublicKey("test-public-key");
      expect(tx).to.not.be.undefined;
    } catch (error) {
      console.error("Error in registerPublicKey test:", error);
      throw error;
    }
  });

  it("should publish an encrypted message", async () => {
    try {
      const tx = await contractInteraction.publishMessage(
        "0x1234567890123456789012345678901234567890",
        "Test message",
        keyPair.publicKey
      );
      expect(tx).to.not.be.undefined;
    } catch (error) {
      console.error("Error in publishMessage test:", error);
      throw error;
    }
  });
});
