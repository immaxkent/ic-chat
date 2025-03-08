import { expect } from "chai";
import { ethers } from "ethers";
import { ContractUtils } from "../../../shared/ethereum/contractUtils";
import { generateRsaKeyPair } from "../../../shared/crypto/rsaEncryption";
import * as dotenv from "dotenv";
import { getValidPrivateKey } from "../../helpers/testUtils";

// Load environment variables
dotenv.config();

// Get a valid private key for testing
const privateKey = getValidPrivateKey(
  process.env.PRIVATE_KEY || process.env.TEST_PRIVATE_KEY
);

describe("Contract Utilities (New Structure)", () => {
  let provider: ethers.JsonRpcProvider;
  let contractUtils: ContractUtils;

  before(() => {
    // Use a local provider for testing
    provider = new ethers.JsonRpcProvider("http://localhost:8545");
    contractUtils = new ContractUtils(provider);
  });

  it("should connect a wallet correctly", () => {
    // Use environment private key or generate a test wallet
    const walletPrivateKey =
      privateKey || ethers.Wallet.createRandom().privateKey;
    contractUtils.connectWallet(walletPrivateKey);

    // Create a wallet with the same private key for comparison
    const wallet = new ethers.Wallet(walletPrivateKey);

    expect(contractUtils.wallet).to.not.be.null;
    expect(contractUtils.wallet?.address).to.equal(wallet.address);
  });

  it("should set and use RSA keys", () => {
    // Use environment private key or fallback to test value
    const seed = privateKey
      ? privateKey.startsWith("0x")
        ? privateKey.substring(2)
        : privateKey
      : "test-utils-seed-1234";

    // Generate keys deterministically
    const keyPair = generateRsaKeyPair(seed);

    contractUtils.setRsaKeys(keyPair.publicKey, keyPair.privateKey);

    const message = "Test encryption";
    const encrypted = contractUtils.encryptMessage(message);
    expect(encrypted).to.not.equal(message);

    const decrypted = contractUtils.decryptMessage(encrypted);
    expect(decrypted).to.equal(message);
  });

  it("should sign messages with Ethereum wallet", async () => {
    // Use environment private key or fallback
    const testPrivateKey =
      privateKey ||
      "0x0123456789012345678901234567890123456789012345678901234567890123";

    contractUtils.connectWallet(testPrivateKey);

    const message = "Message to sign";
    const signature = await contractUtils.signMessage(message);

    // Verify signature
    const walletAddress = contractUtils.wallet?.address.toLowerCase() || "";
    const isValid = contractUtils.verifyEthereumSignature(
      message,
      signature,
      walletAddress
    );

    expect(isValid).to.be.true;
  });
});
