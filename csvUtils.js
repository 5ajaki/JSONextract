const fs = require("fs");
const { parse } = require("csv-parse");
const Web3 = require("web3"); // Import Web3

async function readSafesFromCSV(filePath) {
  const safes = [];
  const parser = fs
    .createReadStream(filePath)
    .pipe(parse({ delimiter: ",", from_line: 2 }));

  for await (const row of parser) {
    try {
      // Convert address to checksum format
      const checksumAddress = Web3.utils.toChecksumAddress(row[0].trim());
      safes.push(checksumAddress);
    } catch (error) {
      console.error(`Invalid address format: ${row[0].trim()}`, error);
    }
  }

  return safes;
}

module.exports = { readSafesFromCSV };
