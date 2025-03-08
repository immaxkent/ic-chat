import { expect } from "chai";
import { ethers } from "ethers";
import { AnvilManager } from "../../../scripts/anvil";
import { ContractUtils } from "../../../shared/ethereum/contractUtils";
import { ContractInteraction } from "../../../shared/ethereum/contractInteraction";
import { SentientABI } from "../../../shared/contracts/abis";
import {
  generateRsaKeyPair,
  encryptWithRSA,
  decryptWithRSA,
} from "../../../shared/crypto/rsaEncryption";

// Skip tests if not running integration tests
const runTests = process.env.RUN_INTEGRATION_TESTS === "true";
const describeIntegration = runTests ? describe : describe.skip;

describeIntegration("Complete User Journey", function () {
  this.timeout(30000);

  let anvilManager: AnvilManager;
  let provider: ethers.JsonRpcProvider;
  let contractAddress: string;

  // User wallets and utilities
  let aliceWallet: ethers.Wallet;
  let bobWallet: ethers.Wallet;
  let aliceUtils: ContractUtils;
  let bobUtils: ContractUtils;

  before(async function () {
    // Start Anvil
    anvilManager = new AnvilManager("./logs/anvil-integration.log");
    await anvilManager.start();

    // Set up provider
    provider = new ethers.JsonRpcProvider("http://localhost:8545");

    // Deploy contract
    // ... contract deployment logic ...
    contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Example address

    // Set up user wallets
    const testAccounts = anvilManager.getTestAccounts();
    aliceWallet = new ethers.Wallet(testAccounts.privateKeys[0], provider);
    bobWallet = new ethers.Wallet(testAccounts.privateKeys[1], provider);

    // Create contract utilities
    aliceUtils = new ContractUtils(provider, aliceWallet.privateKey);
    bobUtils = new ContractUtils(provider, bobWallet.privateKey);

    // Connect to contract
    aliceUtils.connectToContract(contractAddress, SentientABI);
    bobUtils.connectToContract(contractAddress, SentientABI);
  });

  after(async function () {
    await anvilManager.stop();
  });

  it("Alice registers her public key", async function () {
    // Generate RSA keys
    const aliceKeyPair = generateRsaKeyPair(aliceWallet.privateKey.slice(2));
    aliceUtils.setRsaKeys(aliceKeyPair.publicKey, aliceKeyPair.privateKey);

    // Register on contract
    const aliceContract = new ContractInteraction(
      aliceUtils,
      aliceUtils,
      SentientABI,
      contractAddress
    );

    await aliceContract.registerPublicKey();

    // Verify registration
    const registeredKey = await aliceContract.getPublicKey(aliceWallet.address);
    expect(registeredKey).to.equal(aliceKeyPair.publicKey);
  });

  // Add more steps to the user journey
});
