import { ContractUtils } from "../../shared/ethereum/contractUtils";

// Only for testing!
export class TestContractUtils extends ContractUtils {
  // Add method for testing
  public setContract(c: any) {
    this.contract = c;
  }
}
