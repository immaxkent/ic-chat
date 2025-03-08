import { execSync, spawn, ChildProcess } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { ethers } from "ethers";

/**
 * Manages Anvil for integration tests
 */
export class AnvilManager {
  private anvilProcess: ChildProcess | null = null;
  private logFile: string;

  constructor(logPath: string = "anvil.log") {
    this.logFile = logPath;
  }

  /**
   * Start Anvil with the specified options
   */
  async start(
    options: {
      chainId?: number;
      blockTime?: number;
      port?: number;
    } = {}
  ): Promise<void> {
    const { chainId = 31337, blockTime = 1, port = 8545 } = options;

    // Kill any existing Anvil process
    this.stop();

    // Clear previous log
    if (fs.existsSync(this.logFile)) {
      fs.unlinkSync(this.logFile);
    }

    // Create logs directory if it doesn't exist
    const logsDir = path.dirname(this.logFile);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Start Anvil as a child process
    console.log(`Starting Anvil on port ${port}...`);
    const logStream = fs.createWriteStream(this.logFile, { flags: "a" });

    this.anvilProcess = spawn(
      "anvil",
      [
        "--chain-id",
        chainId.toString(),
        "--block-time",
        blockTime.toString(),
        "--port",
        port.toString(),
      ],
      {
        stdio: ["ignore", "pipe", "pipe"],
      }
    );

    if (this.anvilProcess.stdout) {
      this.anvilProcess.stdout.pipe(logStream);
    }

    if (this.anvilProcess.stderr) {
      this.anvilProcess.stderr.pipe(logStream);
    }

    // Wait for Anvil to start
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Anvil failed to start within timeout"));
      }, 5000);

      const checkInterval = setInterval(() => {
        try {
          // Try to connect to Anvil
          const provider = new ethers.JsonRpcProvider(
            `http://localhost:${port}`
          );
          provider.getBlockNumber().then(() => {
            clearTimeout(timeout);
            clearInterval(checkInterval);
            resolve();
          });
        } catch (e) {
          // Keep waiting
        }
      }, 500);
    });

    console.log("Anvil started successfully");
  }

  /**
   * Stop Anvil process
   */
  stop(): void {
    if (this.anvilProcess) {
      console.log("Stopping Anvil...");

      try {
        // On Unix systems
        process.kill(-this.anvilProcess.pid!, "SIGINT");
      } catch (e) {
        try {
          // Direct kill
          this.anvilProcess.kill("SIGINT");
        } catch (e2) {
          // Last resort
          execSync("pkill -f anvil");
        }
      }

      this.anvilProcess = null;
      console.log("Anvil stopped");
    }
  }

  /**
   * Deploy a contract to Anvil
   */
  async deployContract(
    contractPath: string,
    contractName: string,
    constructorArgs: string[] = []
  ): Promise<string> {
    // Use the first Anvil test account
    const privateKey =
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

    console.log(`Deploying ${contractName} to Anvil...`);

    // Build the command with constructor args
    const argsString =
      constructorArgs.length > 0
        ? " --constructor-args " + constructorArgs.join(" ")
        : "";

    // Make the command build the right path
    const fullContractName = contractPath.endsWith(".sol")
      ? `${contractPath}:${contractName}`
      : `${contractPath}:${contractName}`;

    // Execute forge create
    const command = `forge create --rpc-url http://localhost:8545 --private-key ${privateKey} ${fullContractName}${argsString}`;

    try {
      const output = execSync(command).toString();
      console.log(output);

      // Extract deployed address
      const matches = output.match(/Deployed to: (0x[a-fA-F0-9]{40})/);
      const contractAddress = matches ? matches[1] : "";

      if (!contractAddress) {
        throw new Error("Failed to extract contract address from forge output");
      }

      console.log(`Contract deployed at: ${contractAddress}`);
      return contractAddress;
    } catch (error) {
      console.error("Deployment failed:", error);
      throw error;
    }
  }

  /**
   * Get test accounts from Anvil
   */
  getTestAccounts(): {
    privateKeys: string[];
    addresses: string[];
  } {
    // These are the default test accounts for Anvil
    const privateKeys = [
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
      "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
      "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
      "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
      "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a",
      "0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba",
      "0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e",
      "0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356",
      "0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97",
      "0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6",
    ];

    const addresses = privateKeys.map((pk) => {
      const wallet = new ethers.Wallet(pk);
      return wallet.address;
    });

    return { privateKeys, addresses };
  }
}

// Direct script execution
if (require.main === module) {
  const action = process.argv[2] || "start";
  const anvilManager = new AnvilManager();

  if (action === "start") {
    anvilManager
      .start()
      .then(() => console.log("Anvil is running. Press Ctrl+C to stop."))
      .catch(console.error);

    // Keep the process running
    process.on("SIGINT", () => {
      anvilManager.stop();
      process.exit(0);
    });
  } else if (action === "stop") {
    anvilManager.stop();
  } else if (action === "deploy") {
    const contractPath = process.argv[3];
    const contractName = process.argv[4];
    const constructorArgs = process.argv.slice(5);

    if (!contractPath || !contractName) {
      console.error(
        "Usage: ts-node scripts/anvil.ts deploy <contractPath> <contractName> [constructorArgs...]"
      );
      process.exit(1);
    }

    anvilManager
      .start()
      .then(() =>
        anvilManager.deployContract(contractPath, contractName, constructorArgs)
      )
      .then((address) => {
        console.log(`Contract deployed to: ${address}`);
        anvilManager.stop();
      })
      .catch((error) => {
        console.error("Deployment failed:", error);
        anvilManager.stop();
        process.exit(1);
      });
  } else {
    console.error("Unknown action. Use 'start', 'stop', or 'deploy'.");
    process.exit(1);
  }
}
