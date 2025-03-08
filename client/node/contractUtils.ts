/**
 * Node.js specific adapter for ContractUtils (from the original)
 * Kept for backward compatibility with existing tests
 */
import { ethers } from "ethers";
import { ContractUtils as BaseContractUtils } from "@/shared/ethereum/contractUtils";
import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Extended version of ContractUtils with Node.js specific features
 */
export class ContractUtils extends BaseContractUtils {
  /**
   * Additional Node.js specific method to load ABI from file
   */
  static loadAbiFromFile(path: string): any[] {
    try {
      const abiJson = fs.readFileSync(path, "utf8");
      return JSON.parse(abiJson);
    } catch (error) {
      console.error(`Error loading ABI from ${path}:`, error);
      throw error;
    }
  }

  /**
   * Load RSA keys from filesystem (Node.js only)
   */
  loadRsaKeysFromFile(publicKeyPath: string, privateKeyPath: string): void {
    try {
      const publicKey = fs.readFileSync(publicKeyPath, "utf8");
      const privateKey = fs.readFileSync(privateKeyPath, "utf8");
      this.setRsaKeys(publicKey, privateKey);
    } catch (error) {
      console.error("Error loading RSA keys from files:", error);
      throw error;
    }
  }
}
