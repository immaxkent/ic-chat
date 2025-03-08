import { BaseContract, ContractTransactionResponse } from "ethers";

export interface SentientContract extends BaseContract {
  // Data methods
  getData: (key: string) => Promise<string>;
  updateData: (
    key: string,
    value: string
  ) => Promise<ContractTransactionResponse>;

  // Oracle request methods
  pingRequest: (key: string) => Promise<ContractTransactionResponse>;

  // Public key methods
  registerPublicKey: (
    publicKey: string
  ) => Promise<ContractTransactionResponse>;
  getPublicKey: (address: string) => Promise<string>;

  // Message methods
  publishMessage: (
    recipient: string,
    encryptedMessage: string
  ) => Promise<ContractTransactionResponse>;

  // Other methods as needed
  getAddress: () => Promise<string>;
}
