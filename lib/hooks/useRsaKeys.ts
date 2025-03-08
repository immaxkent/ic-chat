import { useState, useEffect, useCallback } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { generateRsaKeyPair } from "../../shared/crypto/rsaEncryption";

/**
 * Hook for managing RSA keys in React applications
 */
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

        // Store in localStorage (only in browser environments)
        if (typeof window !== "undefined") {
          localStorage.setItem(
            `rsa-keys-${address}`,
            JSON.stringify(newKeyPair)
          );
        }

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
    if (address && typeof window !== "undefined") {
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
