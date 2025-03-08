import { ConnectButton } from "@/components/ConnectButton";
import { WalletInfo } from "@/components/WalletInfo";
import { RsaKeyManager } from "@/components/RsaKeyManager";
import { ContractInteraction } from "@/components/ContractInteraction";

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            Blockchain Encrypted Messaging
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect your wallet to interact with encrypted messaging on the
            blockchain
          </p>
          <div className="flex justify-center mb-8">
            <ConnectButton />
          </div>
        </div>

        <WalletInfo />
        <RsaKeyManager />
        <ContractInteraction />

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-8">
          <h2 className="text-xl font-bold mb-4">How It Works</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Connect your wallet using the button above</li>
            <li>Generate RSA keys deterministically from your wallet</li>
            <li>Register your public key on the blockchain</li>
            <li>Read and write encrypted data with your keys</li>
            <li>Share messages securely with other participants</li>
          </ol>
        </div>
      </div>
    </main>
  );
}
