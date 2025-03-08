import { ethers } from "ethers";
import { AnvilManager } from "../../scripts/anvil";
import * as fs from "fs";
import * as path from "path";

// Integration test helper
export class IntegrationTestHelper {
  public anvilManager: AnvilManager;
  public provider: ethers.JsonRpcProvider;
  public accounts: {
    privateKeys: string[];
    addresses: string[];
  };
  public contractAddresses: Record<string, string> = {};

  constructor() {
    this.anvilManager = new AnvilManager(
      path.join("logs", "anvil-integration.log")
    );
    this.provider = new ethers.JsonRpcProvider("http://localhost:8545");
    this.accounts = this.anvilManager.getTestAccounts();
  }

  /**
   * Setup the test environment with Anvil and deploy contracts
   */
  async setup(): Promise<void> {
    // Start Anvil
    await this.anvilManager.start();

    // Skip actual deployment for now and use a mock address
    this.contractAddresses.Sentient =
      "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    // Save mock address to file
    const addressesDir = path.join("test", "integration", "addresses");
    if (!fs.existsSync(addressesDir)) {
      fs.mkdirSync(addressesDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(addressesDir, "contracts.json"),
      JSON.stringify(this.contractAddresses, null, 2)
    );
  }

  /**
   * Clean up after tests
   */
  async teardown(): Promise<void> {
    this.anvilManager.stop();
  }

  /**
   * Get a wallet connected to the provider
   */
  getWallet(accountIndex: number = 0): ethers.Wallet {
    return new ethers.Wallet(
      this.accounts.privateKeys[accountIndex],
      this.provider
    );
  }
}
