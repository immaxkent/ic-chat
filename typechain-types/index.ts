import { ethers } from "ethers";

export interface SecureMessaging extends ethers.Contract {}

export const SecureMessaging__factory = {
  connect: (address: string, signerOrProvider: any) => {
    return {} as SecureMessaging;
  },
};
