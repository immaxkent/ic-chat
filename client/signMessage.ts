import { ethers } from "ethers";

// Replace with your private key
const PRIVATE_KEY = "your-private-key-here";

const signMessage = async () => {
  // Initialize the wallet
  const wallet = new ethers.Wallet(PRIVATE_KEY);
  const userAddress: string = wallet.address;
  const action: string = "Withdraw 5 ETH";
  const nonce: number = 12345; // Prevent replay attacks

  // Hash the message using Solidity-compatible encoding
  const messageHash: string = ethers.solidityPackedKeccak256(
    ["address", "string", "uint256"],
    [userAddress, action, nonce]
  );

  // Ethereum-specific message hash
  const ethSignedMessage: string = ethers.hashMessage(
    ethers.getBytes(messageHash)
  );

  // Sign the message
  const signature: string = await wallet.signMessage(
    ethers.getBytes(messageHash)
  );

  return signature;
};

signMessage().catch(console.error);
