import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

/**
 * @todo load from file
 */
const SENTIENT_ABI = [];

export class SentientClient {
  private contract: ethers.Contract;
  private provider: ethers.Provider;

  /**
   * Initialize the Sentient client
   * @param contractAddress The address of the deployed Sentient contract
   * @param rpcUrl Optional RPC URL, defaults to environment variable
   */
  constructor(
    private contractAddress: string,
    rpcUrl: string = process.env.RPC_URL || ""
  ) {
    if (!rpcUrl) {
      throw new Error("No RPC URL. Set in .env");
    }

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.contract = new ethers.Contract(
      contractAddress,
      SENTIENT_ABI,
      this.provider
    );
  }

  /**
   * and read some of the stored data, etc. basic proforma functions, @todo requires updates as the contract evolves. build arch diagram
   */
  async getData(): Promise<string> {
    return await this.contract.getData();
  }

  /**
   * Get the timestamp when the data was last updated
   */
  async getLastUpdated(): Promise<Date> {
    const timestamp = await this.contract.getLastUpdated();
    return new Date(Number(timestamp) * 1000); // Convert from seconds to milliseconds
  }

  /**
   * Get both data and timestamp in a single call
   */
  async getDataInfo(): Promise<{ data: string; lastUpdated: Date }> {
    const [data, timestamp] = await this.contract.getDataInfo();
    return {
      data,
      lastUpdated: new Date(Number(timestamp) * 1000),
    };
  }

  /**
   * Get the owner address of the contract
   */
  async getOwner(): Promise<string> {
    return await this.contract.owner();
  }
}

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS || "";

  if (!contractAddress) {
    console.error("No contract address provided");
    return;
  }

  const client = new SentientClient(contractAddress);

  try {
    const data = await client.getData();
    const lastUpdated = await client.getLastUpdated();
    const owner = await client.getOwner();

    console.log("Sentient Contract Data:", data);
    console.log("Last Updated:", lastUpdated.toLocaleString());
    console.log("Contract Owner:", owner);
  } catch (error) {
    console.error("Error reading from Sentient contract:", error);
  }
}

main().catch(console.error);
