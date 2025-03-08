import React from "react";
import { renderHook, act } from "@testing-library/react-hooks";
import { useRsaKeyPair } from "../lib/hooks/useRsaKeys";
import { useSentientContract } from "../lib/hooks/useContract";

// Mock wagmi hooks
jest.mock("wagmi", () => ({
  useAccount: () => ({ address: "0x1234567890123456789012345678901234567890" }),
  useWalletClient: () => ({
    data: {
      signMessage: async () => "0xmocksignature",
      writeContract: async () => "0xmocktxhash",
    },
  }),
  usePublicClient: () => ({
    readContract: async () => "0xmockdata",
  }),
  useChainId: () => 1,
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("React Hooks (New Structure)", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe("useRsaKeyPair", () => {
    it("should generate RSA keys", async () => {
      const { result, waitForNextUpdate } = renderHook(() => useRsaKeyPair());

      act(() => {
        result.current.generateKeys("test-seed");
      });

      await waitForNextUpdate();

      expect(result.current.keyPair).not.toBeNull();
      expect(result.current.keyPair?.publicKey).toContain("BEGIN PUBLIC KEY");
      expect(result.current.keyPair?.privateKey).toContain("BEGIN PRIVATE KEY");
    });

    it("should load RSA keys from storage", async () => {
      const testKeys = {
        publicKey:
          "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvwDWupTiHILQiA7a0CLf\nILlIUvI9qyCcHiLXwI3+p49y+t7uuAMTmgQNf0UNa3FyFLRJHIZ19n6VR6vv4Z2u\n-----END PUBLIC KEY-----",
        privateKey:
          "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC/ANa6lOIcgtCI\nDtrQIt8guUhS8j2rIJweItfAjf6nj3L63u64AxOaBA1/RQ1rcXIUtEkchnX2fpVH\n-----END PRIVATE KEY-----",
      };

      localStorageMock.setItem(
        "rsa-keys-0x1234567890123456789012345678901234567890",
        JSON.stringify(testKeys)
      );

      const { result } = renderHook(() => useRsaKeyPair());

      expect(result.current.keyPair).not.toBeNull();
      expect(result.current.keyPair?.publicKey).toBe(testKeys.publicKey);
    });
  });

  describe.only("useSentientContract", () => {
    it("should provide contract functions", async () => {
      const { result } = renderHook(() => useSentientContract());

      expect(result.current.getData).toBeDefined();
      expect(result.current.pingRequest).toBeDefined();
      expect(result.current.registerPublicKey).toBeDefined();
      expect(result.current.isConnected).toBe(true);

      // Test getData function
      const data = await result.current.getData("0xsomekey");
      expect(data).toBe("0xmockdata");

      // Test registerPublicKey function
      const tx = await result.current.registerPublicKey("test-public-key");
      expect(tx).toBe("0xmocktxhash");
    });
  });
});
