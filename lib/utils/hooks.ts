import { useState, useEffect, useCallback } from "react";
import {
  usePublicClient,
  useWalletClient,
  useAccount,
  useChainId,
} from "wagmi";
import { SentientABI, RegistryABI } from "../contracts/abis";
import { contractAddresses } from "../contracts/addresses";
import { generateRsaKeyPair } from "./rsaEncryption";

// Hook for generating RSA keys from Ethereum wallet
export function useRsaKeyPair() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [keyPair, setKeyPair] = useState<{
    publicKey: string;
    privateKey: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const generateKeys = useCallback(
    async (customSeed?: string) => {
      if (!address) return null;

      setLoading(true);
      try {
        // Get a seed from wallet signature as we can't access private key directly
        let seed;
        if (customSeed) {
          seed = customSeed;
        } else if (walletClient) {
          // Sign a message to use as seed
          const message = `Generate RSA keys for ${address}`;
          const signature = await walletClient.signMessage({ message });
          seed = signature;
        } else {
          throw new Error("No wallet connected");
        }

        // Generate deterministic RSA key pair
        const newKeyPair = generateRsaKeyPair(seed);
        setKeyPair(newKeyPair);

        // Store in localStorage
        localStorage.setItem(`rsa-keys-${address}`, JSON.stringify(newKeyPair));

        return newKeyPair;
      } catch (error) {
        console.error("Failed to generate RSA keys:", error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [address, walletClient]
  );

  // Try to load keys from storage on mount
  useEffect(() => {
    if (address) {
      const storedKeys = localStorage.getItem(`rsa-keys-${address}`);
      if (storedKeys) {
        try {
          setKeyPair(JSON.parse(storedKeys));
        } catch (e) {
          console.error("Failed to parse stored RSA keys");
        }
      }
    }
  }, [address]);

  return { keyPair, generateKeys, loading };
}

// Hook for interacting with the Sentient contract
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
