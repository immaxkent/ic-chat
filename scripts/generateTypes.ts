import { execSync } from "child_process";
import * as path from "path";
import { fileURLToPath } from "url";
import * as fs from "fs";

// Create equivalent of __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// First compile contracts with Foundry to generate ABIs
console.log("Compiling contracts with Forge...");
try {
  execSync("forge build", { stdio: "inherit" });
  console.log("Compilation successful");
} catch (error) {
  console.error("Compilation failed:", error);
  process.exit(1);
}

// Path to the Foundry out directory where ABIs are stored
const abiDir = path.join(__dirname, "../out");
// Output directory for generated types
const typesDir = path.join(__dirname, "../typechain-types");

// Ensure the out directory exists
if (!fs.existsSync(abiDir)) {
  console.error(
    "ABI directory not found. Make sure Foundry compiled the contracts correctly."
  );
  return;
}

// Run TypeChain on the ABIs
console.log("Generating TypeScript types with TypeChain...");
try {
  execSync("ts-node scripts/processAbis.ts", { stdio: "inherit" });
  console.log("TypeScript types generated successfully");
} catch (error) {
  console.error("TypeChain generation failed:", error);
  process.exit(1);
}

console.log("Generating contract mocks...");
try {
  execSync("ts-node scripts/generateMocks.ts", { stdio: "inherit" });
  console.log("Contract mocks generated successfully");
} catch (error) {
  console.error("Mock generation failed:", error);
  process.exit(1);
}

console.log("Build process complete!");
