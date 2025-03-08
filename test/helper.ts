import { ethers } from "ethers";

/**
 * Helper class for integration tests
 */
export class IntegrationTestHelper {
  public provider: ethers.JsonRpcProvider;

  constructor() {
    this.provider = new ethers.JsonRpcProvider("http://localhost:8545");
  }

  async setup(): Promise<void> {
    // Setup needed for tests
  }

  async teardown(): Promise<void> {
    // Cleanup after tests
  }
}
