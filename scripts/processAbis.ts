import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";
import { execSync } from "child_process";

// Path to the Foundry output directory
const FORGE_OUT_DIR = path.resolve("./out");
// Directory for TypeChain output
const TYPECHAIN_DIR = path.resolve("./typechain");

// Find all contract JSON files (excluding debug files)
console.log("Finding Forge contract outputs...");
const jsonFiles = glob
  .sync(path.join(FORGE_OUT_DIR, "**/*.json"))
  .filter((file) => !file.includes(".dbg.json"));

console.log(`Found ${jsonFiles.length} contract output files`);

// Filter to only include files with valid ABIs
const validAbiFiles = jsonFiles.filter((file) => {
  try {
    const content = fs.readFileSync(file, "utf8");
    const json = JSON.parse(content);
    return json.abi && Array.isArray(json.abi);
  } catch (error) {
    console.warn(`Error reading file ${file}:`, error);
    return false;
  }
});

console.log(`Found ${validAbiFiles.length} files with valid ABIs`);

// Run TypeChain directly on Forge's output files
if (validAbiFiles.length > 0) {
  console.log("Running TypeChain...");
  try {
    // Create a temporary directory for simplified path handling
    const tmpDir = path.resolve("./tmp-abis");
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir);
    }

    // Copy valid ABI files to temp directory with simpler names
    validAbiFiles.forEach((file, index) => {
      const content = fs.readFileSync(file, "utf8");
      const json = JSON.parse(content);
      const contractName = path.basename(file, ".json");

      // Write just the ABI part to a temp file
      fs.writeFileSync(
        path.join(tmpDir, `${contractName}.json`),
        JSON.stringify(json.abi, null, 2)
      );
    });

    // Run TypeChain on the temp directory
    execSync(
      `typechain --target=ethers-v6 --out-dir=${TYPECHAIN_DIR} "${tmpDir}/*.json"`,
      { stdio: "inherit" }
    );

    // Clean up
    validAbiFiles.forEach((file) => {
      const contractName = path.basename(file, ".json");
      try {
        fs.unlinkSync(path.join(tmpDir, `${contractName}.json`));
      } catch (e) {}
    });
    try {
      fs.rmdirSync(tmpDir);
    } catch (e) {}

    console.log("TypeChain completed successfully");
  } catch (error) {
    console.error("TypeChain failed:", error);
    process.exit(1);
  }
} else {
  console.error("No valid ABIs found. TypeChain will not be run.");
  process.exit(1);
}
