import {
  ethers,
  BaseContract,
  Contract,
  ContractTransactionResponse,
} from "ethers";
import { ContractUtils } from "./contractUtils";
import { Sentient } from "../../typechain/Sentient";
import { Sentient__factory } from "../../typechain/factories/Sentient__factory";
import { loadContractAbi } from "../contracts/abiLoader";

/**
 * A class to handle interactions with the blockchain contract
 */
export class ContractInteraction {
  private contractUtils: ContractUtils;
  private rsaManager: ContractUtils;
  public contract: BaseContract | null = null;
  private contractAddress: string;

  /**
   * Initialize with contract utilities
   */
  constructor(
    contractUtils: ContractUtils,
    rsaManager: ContractUtils,
    contractAbi: any[],
    contractAddress: string
  ) {
    this.contractUtils = contractUtils;
    this.rsaManager = rsaManager;
    this.contractAddress = contractAddress;

    // Connect to the contract
    if (contractUtils.contract) {
      this.contract = contractUtils.contract as BaseContract;
    } else {
      contractUtils.connectToContract(contractAddress, contractAbi);
      this.contract = contractUtils.contract! as BaseContract;
    }
  }

  /**
   * Register a public key on the contract
   */
  async registerPublicKey(
    publicKey: string,
    signer?: ethers.Signer
  ): Promise<ethers.TransactionResponse> {
    const messageHash = ethers.keccak256(ethers.toUtf8Bytes(publicKey));
    const signature = await this.rsaManager.signWithEthereum(
      ethers.getBytes(messageHash).toString()
    );

    const signerToUse = signer || this.contractUtils.wallet;
    if (!signerToUse) {
      throw new Error("No signer available");
    }

    const contractWithSigner = this.contract.connect(
      signerToUse
    ) as BaseContract & {
      registerPublicKey: (key: string, sig: string) => Promise<any>;
    };
    const tx = await contractWithSigner.registerPublicKey(publicKey, signature);
    return tx;
  }

  /**
   * Publish an encrypted message to the contract
   */
  async publishMessage(
    recipientAddress: string,
    message: string,
    recipientPublicKey?: string,
    signer?: ethers.Signer
  ): Promise<ethers.TransactionResponse> {
    // Use provided public key or fetch it (in real implementation)
    const publicKeyToUse = recipientPublicKey || "PLACEHOLDER"; // In real app, would fetch from contract

    // Encrypt the message with the recipient's public key
    const encryptedMessage = this.rsaManager.encryptMessage(
      message,
      publicKeyToUse
    );

    // Convert to bytes32 (this is simplified)
    const encryptedBytes32 = ethers.id(encryptedMessage);

    // Create a hash of the payload to sign
    const messageHash = ethers.keccak256(
      ethers.concat([
        ethers.getBytes(ethers.zeroPadValue(recipientAddress, 32)),
        ethers.getBytes(encryptedBytes32),
      ])
    );

    // Sign the hash
    const signature = await this.rsaManager.signWithEthereum(
      ethers.getBytes(messageHash).toString()
    );

    // Get a signer to send the transaction
    const signerToUse = signer || this.contractUtils.wallet;
    if (!signerToUse) {
      throw new Error("No signer available");
    }

    // Get contract with signer
    const contractWithSigner = this.contract.connect(
      signerToUse
    ) as BaseContract & {
      publishMessage: (
        recipient: string,
        msg: string,
        sig: string
      ) => Promise<any>;
    };

    // Publish to contract
    const tx = await contractWithSigner.publishMessage(
      recipientAddress,
      encryptedBytes32,
      signature
    );

    return tx;
  }

  /**
   * Verify a message signature
   */
  async verifyMessageSignature(
    senderAddress: string,
    recipientAddress: string,
    encryptedMessage: string,
    signature: string
  ): Promise<boolean> {
    // Recreate the message hash that was signed
    const messageHash = ethers.keccak256(
      ethers.concat([
        ethers.getBytes(ethers.zeroPadValue(recipientAddress, 32)),
        ethers.getBytes(ethers.id(encryptedMessage)),
      ])
    );

    // Verify the signature
    return this.rsaManager.verifyEthereumSignature(
      ethers.getBytes(messageHash).toString(),
      signature,
      senderAddress
    );
  }

  public async pingRequest(
    dataKey: string
  ): Promise<ContractTransactionResponse> {
    if (!this.checkContractsConnected()) {
      throw new Error("Contracts not connected");
    }

    try {
      // Call the pingRequest method on the contract
      const tx = await this.contractUtils.contract!.pingRequest(dataKey);
      return tx;
    } catch (error) {
      console.error("Error in pingRequest:", error);
      throw error;
    }
  }

  private checkContractsConnected(): boolean {
    return this.contractUtils.contract !== null;
  }
}
