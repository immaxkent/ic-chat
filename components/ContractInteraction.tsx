"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useSentientContract } from "@/lib/hooks/useContract";

export function ContractInteraction() {
  const { address } = useAccount();
  const { getData, pingRequest, contractAddress, isConnected } =
    useSentientContract();
  const [dataKey, setDataKey] = useState("");
  const [dataValue, setDataValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleGetData = async () => {
    if (!dataKey) return;

    setLoading(true);
    try {
      const hexKey = dataKey.startsWith("0x") ? dataKey : `0x${dataKey}`;
      const result = await getData(hexKey);
      setDataValue(result ? result.toString() : "No data found");
    } catch (error) {
      console.error("Error fetching data:", error);
      setDataValue("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const handlePingRequest = async () => {
    if (!dataKey) return;

    setLoading(true);
    try {
      // This would typically include a signature
      const hexKey = dataKey.startsWith("0x") ? dataKey : `0x${dataKey}`;
      // Dummy signature for demo - in real usage you'd sign the key
      const signature = "0x00";

      const hash = await pingRequest(hexKey, signature);
      if (hash) {
        setTxHash(hash);
      }
    } catch (error) {
      console.error("Error pinging request:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="p-4 border border-gray-200 rounded-lg">
        <p className="text-gray-500">
          Connect your wallet to interact with contracts
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 p-6 border border-gray-200 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">Contract Interaction</h2>

      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-1">Contract Address</p>
        <p className="font-mono break-all">
          {contractAddress || "Not configured"}
        </p>
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-500 mb-1">
          Data Key (bytes32)
        </label>
        <input
          type="text"
          value={dataKey}
          onChange={(e) => setDataKey(e.target.value)}
          className="p-2 w-full border border-gray-300 rounded-md"
          placeholder="0x..."
        />
      </div>

      <div className="flex space-x-2 mb-4">
        <button
          onClick={handleGetData}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          disabled={loading || !dataKey}
        >
          {loading ? "Loading..." : "Get Data"}
        </button>

        <button
          onClick={handlePingRequest}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          disabled={loading || !dataKey}
        >
          {loading ? "Sending..." : "Ping Request"}
        </button>
      </div>

      {dataValue && (
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-1">Data Value</p>
          <div className="p-3 bg-gray-50 rounded-md font-mono break-all">
            {dataValue}
          </div>
        </div>
      )}

      {txHash && (
        <div>
          <p className="text-sm text-gray-500 mb-1">Transaction Hash</p>
          <div className="p-3 bg-gray-50 rounded-md font-mono break-all">
            {txHash}
          </div>
        </div>
      )}
    </div>
  );
}
