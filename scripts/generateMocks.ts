import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { sync as globSync } from "glob";
import * as path from "path";

// Ensure mocks directory exists
const MOCKS_DIR = "./test/mocks";
if (!existsSync(MOCKS_DIR)) {
  mkdirSync(MOCKS_DIR, { recursive: true });
}

// Find all generated TypeChain interface files
const typeFiles = globSync("./typechain/factories/**/*__factory.ts").filter(
  (file) => !file.includes(".d.ts")
);

console.log(`Found ${typeFiles.length} TypeChain contract files`);

// Generate a mock for each contract
typeFiles.forEach((file) => {
  const contractName = path.basename(file, ".ts").replace("__factory", "");
  if (contractName.includes("Factory")) return; // Skip factory files themselves

  // Extract the clean contract name
  const cleanContractName = contractName;

  console.log(`Generating mock for ${cleanContractName}`);

  // Generate mock content
  const mockContent = `
import { ethers } from "ethers";
import { ${cleanContractName} } from "../../typechain/${cleanContractName}";
import { ${cleanContractName}__factory } from "../../typechain/factories/${cleanContractName}__factory";

/**
 * Creates a mock ${cleanContractName} contract for testing
 * @param address Optional contract address
 * @returns A mocked contract instance
 */
export function createMock${cleanContractName}(address: string = "0x1234567890123456789012345678901234567890"): ${cleanContractName} {
  // Get the ABI from the factory
  const abi = ${cleanContractName}__factory.abi;
  
  // Create a minimal mock contract
  const mockContract = new ethers.Contract(
    address,
    abi
  ) as unknown as ${cleanContractName};
  
  // Mock transaction methods with consistent returns
  const mockTx = {
    hash: "0xmocktransactionhash",
    wait: async () => ({ status: 1 } as any)
  };
  
  // Get all functions from the ABI
  const functions = abi.filter(item => item.type === "function");
  
  // Override method implementations
  for (const func of functions) {
    const name = func.name;
    const stateMutability = func.stateMutability;
    
    if (stateMutability === "view" || stateMutability === "pure") {
      // For view/pure functions, return dummy values based on return type
      mockContract[name] = async (...args: any[]) => {
        console.log(\`Mock call to \${name}(\${args.join(', ')})\`);
        
        // Very basic return value mocking based on common return types
        const outputs = func.outputs || [];
        if (outputs.length === 0) return null;
        
        // Single return value
        if (outputs.length === 1) {
          const type = outputs[0].type;
          if (type === 'address') return '0xMockAddress000000000000000000000000000000';
          if (type === 'uint256' || type.includes('uint')) return ethers.toBigInt(123);
          if (type === 'bool') return true;
          if (type === 'string') return 'Mock string value';
          if (type === 'bytes' || type === 'bytes32') 
            return ethers.keccak256(ethers.toUtf8Bytes("mock-value"));
          
          // Default fallback
          return "0x00";
        }
        
        // Multiple return values (tuple) - return an array with dummy values
        return outputs.map(output => {
          const type = output.type;
          if (type === 'address') return '0xMockAddress000000000000000000000000000000';
          if (type === 'uint256' || type.includes('uint')) return ethers.toBigInt(123);
          if (type === 'bool') return true;
          if (type === 'string') return 'Mock string value';
          if (type === 'bytes' || type === 'bytes32')
            return ethers.keccak256(ethers.toUtf8Bytes("mock-value"));
          
          // Default fallback
          return "0x00";
        });
      } as any; // Type assertion to bypass TypeScript errors
    } else {
      // For non-view functions (transactions), return mock tx receipt
      mockContract[name] = async (...args: any[]) => {
        console.log(\`Mock transaction to \${name}(\${args.join(', ')})\`);
        return mockTx;
      } as any; // Type assertion to bypass TypeScript errors
    }
  }
  
  // Implement connect method to return a new mock with the same overrides
  const originalConnect = mockContract.connect;
  mockContract.connect = function(signer: ethers.Signer) {
    const connected = originalConnect.call(this, signer);
    
    // Copy all mock implementations to the connected contract
    for (const func of functions) {
      const name = func.name;
      connected[name] = mockContract[name];
    }
    
    return connected as unknown as ${cleanContractName};
  };
  
  return mockContract;
}
`;

  // Write mock file
  const mockFilePath = path.join(MOCKS_DIR, `Mock${cleanContractName}.ts`);
  writeFileSync(mockFilePath, mockContent);
  console.log(`Generated ${mockFilePath}`);
});

// Create an index file for easy imports
const indexContent = typeFiles
  .map((file) => {
    const contractName = path.basename(file, ".ts").replace("__factory", "");
    if (contractName.includes("Factory")) return null;
    return `export * from './Mock${contractName}';`;
  })
  .filter(Boolean)
  .join("\n");

writeFileSync(path.join(MOCKS_DIR, "index.ts"), indexContent);
console.log("Generated mock index file");

console.log("Mock generation complete!");
