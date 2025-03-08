import { expect } from "chai";
import { ethers } from "ethers";
import { IntegrationTestHelper } from "../helper";
import { ContractUtils } from "../../../shared/ethereum/contractUtils";
import { ContractInteraction } from "../../../shared/ethereum/contractInteraction";
import { SentientABI } from "../../../shared/contracts/abis";
import { generateRsaKeyPair } from "../../../shared/crypto/rsaEncryption";

// Only run these tests when explicitly asked for integration tests
// as they require Anvil to be installed and available
const runTests = process.env.RUN_INTEGRATION_TESTS === "true";
const describeIntegration = runTests ? describe : describe.skip;

describeIntegration("Contract Interaction Integration", function () {
  this.timeout(30000); // Integration tests can take longer

  let helper: IntegrationTestHelper;
  let contractUtils: ContractUtils;
  let rsaManager: ContractUtils;
  let contractInteraction: ContractInteraction;
  let contractAddress: string;

  before(async function () {
    // Set up the test environment
    helper = new IntegrationTestHelper();
    await helper.setup();

    // Get deployed contract address
    contractAddress = helper.contractAddresses.Sentient;
    expect(contractAddress).to.match(/^0x[a-fA-F0-9]{40}$/);

    // Get a wallet with funds from Anvil
    const wallet = helper.getWallet(1); // Use the second account

    // Create contract utilities
    contractUtils = new ContractUtils(helper.provider, wallet.privateKey);
    rsaManager = new ContractUtils(helper.provider, wallet.privateKey);

    // Generate RSA keys
    const seedKey = wallet.privateKey.startsWith("0x")
      ? wallet.privateKey.substring(2)
      : wallet.privateKey;
    const keyPair = generateRsaKeyPair(seedKey);

    // Set up the RSA keys
    rsaManager.setRsaKeys(keyPair.publicKey, keyPair.privateKey);

    // Connect to the contract
    contractUtils.connectToContract(contractAddress, SentientABI);

    // Create contract interaction instance
    contractInteraction = new ContractInteraction(
      contractUtils,
      rsaManager,
      SentientABI,
      contractAddress
    );
  });

  after(async function () {
    // Clean up
    await helper.teardown();
  });

  it("should connect to the deployed contract", async function () {
    expect(contractUtils.contract).to.not.be.null;
    expect(contractUtils.wallet).to.not.be.null;

    const address = await contractUtils.contract.getAddress();
    expect(address.toLowerCase()).to.equal(contractAddress.toLowerCase());
  });

  it("should register a public key on the blockchain", async function () {
    // Generate a test public key
    const publicKey =
      "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu0Qe5+8q29QBRu1y+hWF\nTb30rPgCJHZ/SL7dLnIl2FE0RJ+RMHqXDgYTwKLp0YFEiDlTZVYfbVym0FFBTT0I\nu7Rpi2zXOwh+81hn6JisCXIaNAFpNZ96fUfWtVLNMGWUHr6pHOsAFYgA+tZMwrSV\nqgOZ+wgMNZZ2G8gvPFOk0w6UoTLFXB0QRWCzUcDSlB90/nIwOPvVYy8sIMJDQmN2\nK4OVTBBGXKx8SGlLVCxgfS5ma9d3dO8qg2SbXtQgDm+9h/LcP5u/D2EoN8hELnOW\neqHmMxeVLFvM0h0MLWQEUXLi/5UxN2y6usiXRZT1qMGqf7bZ9i6V79QzkG3N7Zde\nAwIDAQAB\n-----END PUBLIC KEY-----";

    // Register the public key
    const tx = await contractInteraction.registerPublicKey(publicKey);
    expect(tx).to.not.be.undefined;

    // Wait for transaction confirmation
    const receipt = await tx.wait();
    expect(receipt.status).to.equal(1);
  });

  it("should be able to publish an encrypted message", async function () {
    // Skip test for now
    this.skip();

    // First user's public key (from previous test)
    const publicKey =
      "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu0Qe5+8q29QBRu1y+hWF\nTb30rPgCJHZ/SL7dLnIl2FE0RJ+RMHqXDgYTwKLp0YFEiDlTZVYfbVym0FFBTT0I\nu7Rpi2zXOwh+81hn6JisCXIaNAFpNZ96fUfWtVLNMGWUHr6pHOsAFYgA+tZMwrSV\nqgOZ+wgMNZZ2G8gvPFOk0w6UoTLFXB0QRWCzUcDSlB90/nIwOPvVYy8sIMJDQmN2\nK4OVTBBGXKx8SGlLVCxgfS5ma9d3dO8qg2SbXtQgDm+9h/LcP5u/D2EoN8hELnOW\neqHmMxeVLFvM0h0MLWQEUXLi/5UxN2y6usiXRZT1qMGqf7bZ9i6V79QzkG3N7Zde\nAwIDAQAB\n-----END PUBLIC KEY-----";

    // A recipient address (use the first Anvil account)
    const recipientAddress = helper.accounts.addresses[0];

    // Send the message
    const message = "This is a secure message sent over the blockchain";
    const tx = await contractInteraction.publishMessage(
      recipientAddress,
      message,
      publicKey
    );

    expect(tx).to.not.be.undefined;

    // Wait for transaction confirmation
    const receipt = await tx.wait();
    expect(receipt.status).to.equal(1);
  });

  it("should be able to retrieve data from the contract", async function () {
    // Skip test for now
    this.skip();

    // This test accesses the initial data set during contract deployment
    const dataKey = ethers.keccak256(ethers.toUtf8Bytes("initial-key"));

    // Check if we can connect to the contract
    expect(contractUtils.contract).to.not.be.null;

    // Call the contract's getData function
    const data = await contractUtils.contract.getData(dataKey);
    expect(data).to.not.be.null;

    // The data should match what we set during deployment
    const expectedValue = ethers.keccak256(ethers.toUtf8Bytes("initial-value"));
    expect(data).to.equal(expectedValue);
  });
});
