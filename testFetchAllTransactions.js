const fs = require("fs");
const { parse } = require("csv-parse"); // Correctly import the parse function
const fetchAllTransactions = require("./fetchAllTransactions");

async function readSafesFromCSV(filePath) {
  const safes = [];
  const parser = fs
    .createReadStream(filePath)
    .pipe(parse({ delimiter: ",", from_line: 2 })); // Assuming there's a header

  for await (const row of parser) {
    safes.push(row[0].trim()); // Assuming the safe address is in the first column
  }

  return safes;
}

async function runTest() {
  try {
    const safes = await readSafesFromCSV("safes.csv");
    const transactions = await fetchAllTransactions(safes);
    console.log("Transactions:", transactions);
  } catch (error) {
    console.error("Error:", error);
  }
}

runTest();
