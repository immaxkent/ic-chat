import { useCallback } from "react";
import {
  usePublicClient,
  useWalletClient,
  useAccount,
  useChainId,
} from "wagmi";
import { SentientABI } from "../../shared/contracts/abis";
import { contractAddresses } from "../../shared/contracts/addresses";

/**
 * Hook for interacting with the Sentient contract in React apps
 */
export function useSentientContract() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  const chainId = useChainId();

  const contractAddress =
    (contractAddresses[chainId]?.sentient as `0x${string}`) || "0x";

  const pingRequest = useCallback(
    async (key: string, signature: string) => {
      if (!walletClient || contractAddress === "0x") return null;

      try {
        const hash = await walletClient.writeContract({
          address: contractAddress,
          abi: SentientABI,
          functionName: "pingRequest",
          args: [key, signature],
        });

        return hash;
      } catch (error) {
        console.error("Error pinging request:", error);
        return null;
      }
    },
    [walletClient, contractAddress]
  );

  const getData = useCallback(
    async (key: string) => {
      if (!publicClient || contractAddress === "0x") return null;

      try {
        const data = await publicClient.readContract({
          address: contractAddress,
          abi: SentientABI,
          functionName: "getData",
          args: [key],
        });

        return data;
      } catch (error) {
        console.error("Error getting data:", error);
        return null;
      }
    },
    [publicClient, contractAddress]
  );

  const registerPublicKey = useCallback(
    async (publicKey: string) => {
      if (!walletClient || contractAddress === "0x") return null;

      try {
        // Create signature
        const message = `Register public key: ${publicKey}`;
        const signature = await walletClient.signMessage({ message });

        const hash = await walletClient.writeContract({
          address: contractAddress,
          abi: SentientABI,
          functionName: "registerPublicKey",
          args: [publicKey, signature],
        });

        return hash;
      } catch (error) {
        console.error("Error registering public key:", error);
        return null;
      }
    },
    [walletClient, contractAddress]
  );

  return {
    pingRequest,
    getData,
    registerPublicKey,
    contractAddress,
    isConnected: !!address,
  };
}
