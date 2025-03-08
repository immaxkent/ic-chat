/**
 * Contract addresses - shared across all platforms
 */

interface ContractAddresses {
  [chainId: number]: {
    sentient?: string;
    registry?: string;
  };
}

export const contractAddresses: ContractAddresses = {
  1: {
    // Mainnet
    sentient: process.env.NEXT_PUBLIC_MAINNET_SENTIENT_ADDRESS || "",
    registry: process.env.NEXT_PUBLIC_MAINNET_REGISTRY_ADDRESS || "",
  },
  11155111: {
    // Sepolia
    sentient: process.env.NEXT_PUBLIC_SEPOLIA_SENTIENT_ADDRESS || "",
    registry: process.env.NEXT_PUBLIC_SEPOLIA_REGISTRY_ADDRESS || "",
  },
};
