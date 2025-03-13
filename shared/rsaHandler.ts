function reconstructRSAPEMKey(keyParts: string[]): string {
  // 1. Combine parts and remove padding zeros
  let hexString = "";
  keyParts.forEach((part) => {
    // Skip '0x' prefix in each part
    hexString += part.slice(2);
  });

  // Remove padding zeros at the end
  hexString = hexString.replace(/0+$/, "");

  // 2. Convert hex to binary
  const bytes = Buffer.from(hexString, "hex");

  // 3. Base64 encode and format as PEM
  const base64 = bytes.toString("base64");
  const formattedBase64 = base64.match(/.{1,64}/g)?.join("\n") || "";
  const pemKey = `-----BEGIN PUBLIC KEY-----\n${formattedBase64}\n-----END PUBLIC KEY-----`;

  return pemKey;
}

/**
 * Prepares an RSA public key in PEM format for smart contract storage, splitting it into bytes32 chunks
 * @param rsaPublicKeyPEM The RSA public key in PEM format
 * @returns An array of bytes32 strings (up to 4 chunks)
 */
function prepareRSAKeyForContract(rsaPublicKeyPEM: string): string[] {
  // 1. Strip headers and newlines from PEM
  const pemContents = rsaPublicKeyPEM
    .replace("-----BEGIN PUBLIC KEY-----", "")
    .replace("-----END PUBLIC KEY-----", "")
    .replace(/\n/g, "");

  // Base64 decode base64 to  binary
  const binaryKey = Buffer.from(pemContents, "base64").toString("binary");

  // 3. Convert to hex string
  let hexString = "";
  for (let i = 0; i < binaryKey.length; i++) {
    const hex = binaryKey.charCodeAt(i).toString(16).padStart(2, "0");
    hexString += hex;
  }

  // 4. Split into 32-byte chunks (64 hex chars per chunk)
  const chunks: string[] = [];
  const chunkSize = 64; // 32 bytes = 64 hex chars

  for (let i = 0; i < hexString.length; i += chunkSize) {
    const chunk =
      "0x" + hexString.slice(i, i + chunkSize).padEnd(chunkSize, "0");
    chunks.push(chunk);
  }
  return chunks.slice(0, 4);
}

export { prepareRSAKeyForContract, reconstructRSAPEMKey };
