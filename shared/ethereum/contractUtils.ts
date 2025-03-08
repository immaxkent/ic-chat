import { ethers } from "ethers";
import {
  encryptWithRSA,
  decryptWithRSA,
  loadRsaKeysFromFiles,
} from "../crypto/rsaEncryption";
import { BaseContract, Contract } from "ethers";
import { SentientContract } from "../contracts/types";

/**
 * Core contract utilities for all platforms
 * Combines functionality from client/contractUtils.ts and lib/utils/contractUtils.ts
 */
export class ContractUtils {
  private _provider: ethers.JsonRpcProvider;
  private _wallet: ethers.Wallet | null = null;
  private _contract: SentientContract | null = null;
  private _rsaPublicKey: string | null = null;
  private _rsaPrivateKey: string | null = null;

  /**
   * Initialize with a provider and optional private key
   */
  constructor(
    provider: ethers.Provider,
    ethereumPrivateKey?: string,
    contractAddress?: string
  ) {
    this._provider = provider as ethers.JsonRpcProvider;

    if (ethereumPrivateKey) {
      this.connectWallet(ethereumPrivateKey);
    }

    if (contractAddress && this._contract === null) {
      // If a contract address is provided but no contract is connected yet
      // This is a placeholder - usually the ABI would also be needed
      console.warn(
        "Contract address provided but no ABI - you'll need to call connectToContract"
      );
    }
  }

  public get wallet(): ethers.Wallet | null {
    return this._wallet;
  }

  public get contract(): SentientContract | null {
    return this._contract;
  }

  /**
   * Connect to a contract
   */
  public connectToContract(
    contractAddress: string,
    contractAbi: any
  ): SentientContract {
    if (!this._wallet) {
      throw new Error("Wallet not connected");
    }

    // Cast the contract to the SentientContract type
    this._contract = new ethers.Contract(
      contractAddress,
      contractAbi,
      this._wallet
    ) as unknown as SentientContract;

    return this._contract;
  }

  /**
   * Connect an Ethereum wallet
   */
  connectWallet(privateKey: string): void {
    this._wallet = new ethers.Wallet(privateKey, this._provider);

    // Update contract with signer if it exists
    if (this._contract) {
      // Safe type assertion
      this._contract = this._contract.connect(this._wallet) as SentientContract;
    }
  }

  /**
   * Set RSA keys for encryption/decryption
   */
  setRsaKeys(publicKey: string, privateKey: string): void {
    this._rsaPublicKey = publicKey;
    this._rsaPrivateKey = privateKey;
  }

  /**
   * Load RSA keys from filesystem (Node.js only) or memory
   */
  loadRsaKeys(publicKeyPath?: string, privateKeyPath?: string): boolean {
    // Try loading from files in Node.js environment
    if (typeof window === "undefined" && publicKeyPath && privateKeyPath) {
      const keys = loadRsaKeysFromFiles(publicKeyPath, privateKeyPath);
      if (keys) {
        this._rsaPublicKey = keys.publicKey;
        this._rsaPrivateKey = keys.privateKey;
        return true;
      }
      return false;
    }

    // In browser environment, do nothing - keys should be provided
    // or generated through other means
    return this._rsaPublicKey !== null && this._rsaPrivateKey !== null;
  }

  /**
   * Encrypt a message with RSA
   */
  encryptMessage(message: string, publicKey?: string): string {
    const keyToUse = publicKey || this._rsaPublicKey;
    if (!keyToUse) {
      throw new Error("No RSA public key available");
    }
    return encryptWithRSA(message, keyToUse);
  }

  /**
   * Decrypt a message with RSA
   */
  decryptMessage(encryptedMessage: string): string {
    if (!this._rsaPrivateKey) {
      throw new Error("No RSA private key available");
    }
    return decryptWithRSA(encryptedMessage, this._rsaPrivateKey);
  }

  /**
   * Sign a message with the Ethereum wallet
   */
  async signMessage(message: string): Promise<string> {
    if (!this._wallet) {
      throw new Error("No wallet connected");
    }
    return await this._wallet.signMessage(message);
  }

  /**
   * Sign data with Ethereum private key
   */
  async signWithEthereum(data: string): Promise<string> {
    return this.signMessage(data);
  }

  /**
   * Verify an Ethereum signature
   */
  verifyEthereumSignature(
    message: string,
    signature: string,
    expectedSigner: string
  ): boolean {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === expectedSigner.toLowerCase();
  }

  /**
   * Load an ABI from a file (Node.js only)
   */
  static loadAbiFromFile(path: string): any[] {
    if (typeof window === "undefined") {
      try {
        const fs = require("fs");
        const abiJson = fs.readFileSync(path, "utf8");
        return JSON.parse(abiJson);
      } catch (error) {
        console.error(`Error loading ABI from ${path}:`, error);
        throw error;
      }
    } else {
      throw new Error(
        "loadAbiFromFile is only available in Node.js environment"
      );
    }
  }

  public setContract(contract: SentientContract): void {
    this._contract = contract;
  }
}
