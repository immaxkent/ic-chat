import { ethers } from "ethers";

/**
 * Gets a valid private key from inputs or generates a random one
 * @param privateKey Optional private key to validate
 * @returns A valid Ethereum private key
 */
export function getValidPrivateKey(envKey?: string): string {
  // If no key provided from env, generate one
  if (!envKey) {
    return ethers.Wallet.createRandom().privateKey;
  }

  try {
    // Check if it's a valid private key by creating a wallet
    // This will throw if invalid
    new ethers.Wallet(envKey);
    return envKey;
  } catch (error) {
    console.warn(
      `Invalid private key in env file, using generated key instead`
    );
    return ethers.Wallet.createRandom().privateKey;
  }
}
