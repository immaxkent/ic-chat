import * as fs from "fs";
import * as path from "path";

// Path to Forge's output directory
const FORGE_OUT_DIR = path.resolve(process.cwd(), "./out");

/**
 * Dynamically loads an ABI directly from Forge's compiled output
 * @param contractName The name of the contract (e.g., "Sentient")
 * @returns The contract ABI
 */
export function loadContractAbi(contractName: string): any[] {
  try {
    // Forge places ABIs in out/ContractName.sol/ContractName.json
    // First try direct path if contract name exactly matches file name
    let abiPath = path.join(
      FORGE_OUT_DIR,
      `${contractName}.sol/${contractName}.json`
    );

    // If not found, search for it
    if (!fs.existsSync(abiPath)) {
      // Search for the contract in any file
      const files = fs.readdirSync(FORGE_OUT_DIR, {
        recursive: true,
      }) as string[];
      const contractFile = files.find(
        (file) =>
          file.endsWith(`${contractName}.json`) && !file.includes(".dbg.")
      );

      if (!contractFile) {
        throw new Error(
          `ABI for ${contractName} not found in Forge output. ` +
            "Make sure the contract is compiled with 'forge build'."
        );
      }

      abiPath = path.join(FORGE_OUT_DIR, contractFile);
    }

    // Read the Forge output file
    const fileContent = fs.readFileSync(abiPath, "utf8");
    const json = JSON.parse(fileContent);

    // Return just the ABI portion
    if (!json.abi || !Array.isArray(json.abi)) {
      throw new Error(`Invalid ABI format in ${abiPath}`);
    }

    return json.abi;
  } catch (error) {
    console.error(`Error loading ABI for ${contractName}:`, error);
    throw error;
  }
}

/**
 * Gets the address for a contract from the deployment addresses file
 * @param contractName The name of the contract (e.g., "Sentient")
 * @param chainId Optional chain ID to get network-specific address
 * @returns The contract address
 */
export function getContractAddress(
  contractName: string,
  chainId?: number
): string {
  try {
    // Path to addresses JSON (created during deployment)
    const addressesPath = path.resolve(
      process.cwd(),
      "./shared/contracts/addresses.json"
    );

    if (!fs.existsSync(addressesPath)) {
      throw new Error(
        `Contract addresses file not found at ${addressesPath}. ` +
          "Make sure contracts are deployed and addresses are saved."
      );
    }

    const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));

    // If chainId provided, look for network-specific address
    if (chainId && addresses[chainId]) {
      return addresses[chainId][contractName];
    }

    // Otherwise return from the default section
    return addresses.default[contractName];
  } catch (error) {
    console.error(`Error getting address for ${contractName}:`, error);
    throw error;
  }
}
