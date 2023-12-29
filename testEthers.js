// testEthers.js
const ethers = require("ethers");

try {
  const checksumAddress = ethers.utils.getAddress("0xabcdef1234567890");
  console.log(checksumAddress);
} catch (error) {
  console.error("Error:", error);
}
