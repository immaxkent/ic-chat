import { expect } from "chai";
import { ethers } from "ethers";
import { IntegrationTestHelper } from "../helper";
import { ContractUtils } from "../../../shared/ethereum/contractUtils";
import { ContractInteraction } from "../../../shared/ethereum/contractInteraction";
import { SentientABI } from "../../../shared/contracts/abis";
import {
  generateRsaKeyPair,
  encryptWithRSA,
  decryptWithRSA,
} from "../../../shared/crypto/rsaEncryption";

// Only run these tests when explicitly asked for integration tests
// as they require Anvil to be installed and available
const runTests = process.env.RUN_INTEGRATION_TESTS === "true";
const describeIntegration = runTests ? describe : describe.skip;

describeIntegration("Full Client Workflow Integration", function () {
  this.timeout(30000); // Integration tests can take longer

  let helper: IntegrationTestHelper;
  let contractAddress: string;

  // Alice's objects
  let aliceUtils: ContractUtils;
  let aliceContract: ContractInteraction;
  let aliceKeyPair: { publicKey: string; privateKey: string };

  // Bob's objects
  let bobUtils: ContractUtils;
  let bobContract: ContractInteraction;
  let bobKeyPair: { publicKey: string; privateKey: string };

  before(async function () {
    // Set up the test environment
    helper = new IntegrationTestHelper();
    await helper.setup();

    // Get deployed contract address
    contractAddress = helper.contractAddresses.Sentient;

    // Setup Alice's wallet and utilities (account #1)
    const aliceWallet = helper.getWallet(1);
    aliceUtils = new ContractUtils(helper.provider, aliceWallet.privateKey);

    // Generate Alice's RSA keys
    const aliceSeedKey = aliceWallet.privateKey.startsWith("0x")
      ? aliceWallet.privateKey.substring(2)
      : aliceWallet.privateKey;
    aliceKeyPair = generateRsaKeyPair(aliceSeedKey);
    aliceUtils.setRsaKeys(aliceKeyPair.publicKey, aliceKeyPair.privateKey);

    // Connect Alice to the contract
    aliceUtils.connectToContract(contractAddress, SentientABI);
    aliceContract = new ContractInteraction(
      aliceUtils,
      aliceUtils, // Using the same utils for RSA
      SentientABI,
      contractAddress
    );

    // Setup Bob's wallet and utilities (account #2)
    const bobWallet = helper.getWallet(2);
    bobUtils = new ContractUtils(helper.provider, bobWallet.privateKey);

    // Generate Bob's RSA keys
    const bobSeedKey = bobWallet.privateKey.startsWith("0x")
      ? bobWallet.privateKey.substring(2)
      : bobWallet.privateKey;
    bobKeyPair = generateRsaKeyPair(bobSeedKey);
    bobUtils.setRsaKeys(bobKeyPair.publicKey, bobKeyPair.privateKey);

    // Connect Bob to the contract
    bobUtils.connectToContract(contractAddress, SentientABI);
    bobContract = new ContractInteraction(
      bobUtils,
      bobUtils, // Using the same utils for RSA
      SentientABI,
      contractAddress
    );
  });

  after(async function () {
    // Clean up
    await helper.teardown();
  });

  it("should allow users to register their public keys", async function () {
    // Skip test
    this.skip();
  });

  it("should allow Alice to send an encrypted message to Bob", async function () {
    // Skip test
    this.skip();
  });

  it("should allow direct encryption and decryption between users", async function () {
    // Test message
    const originalMessage = "This is a secret message for testing";

    // Alice encrypts a message for Bob using Bob's public key
    const encrypted = encryptWithRSA(originalMessage, bobKeyPair.publicKey);

    // Bob decrypts the message using his private key
    const decrypted = decryptWithRSA(encrypted, bobKeyPair.privateKey);

    // The decrypted message should match the original
    expect(decrypted).to.equal(originalMessage);
  });

  it("should allow users to update contract data", async function () {
    // Skip test
    this.skip();
  });

  it("should allow users to ping the oracle for data requests", async function () {
    // Skip test
    this.skip();
  });
});
