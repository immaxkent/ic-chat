/**
 * Contract ABIs - shared across all platforms
 */

// Define ABIs since we may not have actual compiled contracts yet
export const SentientABI = [
  "function getData(bytes32 key) external view returns (bytes32)",
  "function pingRequest(bytes32 key, bytes memory signature) external",
  "function registerPublicKey(string memory publicKey, bytes memory signature) external",
  "function updateData(bytes32[2] memory dataEntry) public",
  "event DataUpdated(bytes32 newData, uint256 timestamp)",
  "event DataRequest(bytes32 signedRequestParameters, address publicKey)",
  "event PublicKeyRegistered(address indexed owner, string publicKey)",
];

export const RegistryABI = [
  "function registerUser(address user, string memory name) external",
  "function getUserName(address user) external view returns (string memory)",
  "function isRegistered(address user) external view returns (bool)",
];

// When you have compiled contracts, you can use this alternative:
/*
import { abi as SentientABI } from "../../out/Sentient.sol/Sentient.json";
import { abi as RegistryABI } from "../../out/Registry.sol/Registry.json";

export { SentientABI, RegistryABI };
*/
