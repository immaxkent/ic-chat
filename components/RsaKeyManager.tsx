"use client";

import { useState } from "react";
import { useRsaKeyPair } from "@/lib/hooks/useRsaKeys";
import { useSentientContract } from "@/lib/hooks/useContract";

export function RsaKeyManager() {
  const { keyPair, generateKeys, loading } = useRsaKeyPair();
  const { registerPublicKey } = useSentientContract();
  const [customSeed, setCustomSeed] = useState("");
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<string | null>(
    null
  );

  const handleRegisterPublicKey = async () => {
    if (!keyPair) return;

    setRegistering(true);
    try {
      const result = await registerPublicKey(keyPair.publicKey);
      if (result) {
        setRegistrationResult(`Key registered! TX: ${result}`);
      } else {
        setRegistrationResult("Registration failed");
      }
    } catch (error) {
      console.error("Error registering key:", error);
      setRegistrationResult("Error: Registration failed");
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="mt-8 p-6 border border-gray-200 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">RSA Key Management</h2>

      {keyPair ? (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Public Key</p>
            <div className="p-3 bg-gray-50 rounded-md font-mono text-xs overflow-x-auto max-h-24">
              {keyPair.publicKey}
            </div>
          </div>

          <div>
            <div className="flex items-center mb-1">
              <p className="text-sm text-gray-500">Private Key</p>
              <button
                onClick={() => setShowPrivateKey(!showPrivateKey)}
                className="ml-2 text-xs text-blue-500 hover:text-blue-700"
              >
                {showPrivateKey ? "Hide" : "Show"}
              </button>
            </div>

            {showPrivateKey ? (
              <div className="p-3 bg-gray-50 rounded-md font-mono text-xs overflow-x-auto max-h-24">
                {keyPair.privateKey}
              </div>
            ) : (
              <div className="p-3 bg-gray-50 rounded-md text-xs">
                ***** HIDDEN *****
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => generateKeys()}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition"
              disabled={loading}
            >
              {loading ? "Generating..." : "Regenerate Keys"}
            </button>

            <button
              onClick={handleRegisterPublicKey}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
              disabled={registering}
            >
              {registering ? "Registering..." : "Register Public Key"}
            </button>
          </div>

          {registrationResult && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-sm">
              {registrationResult}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600">
            No RSA keys found. Generate a new key pair.
          </p>

          <div>
            <label className="block text-sm text-gray-500 mb-1">
              Custom Seed (Optional)
            </label>
            <input
              type="text"
              value={customSeed}
              onChange={(e) => setCustomSeed(e.target.value)}
              className="p-2 w-full border border-gray-300 rounded-md"
              placeholder="Enter a custom seed if desired"
            />
            <p className="text-xs text-gray-400 mt-1">
              By default, we'll generate a seed from your wallet signature.
            </p>
          </div>

          <button
            onClick={() => generateKeys(customSeed || undefined)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate RSA Keys"}
          </button>
        </div>
      )}
    </div>
  );
}
