const fetchAllTransactions = require("./fetchAllTransactions");
const generateCsvReport = require("./generateCsvReport");
const { readSafesFromCSV } = require("./csvUtils"); // Adjust the path as needed
const fs = require("fs");

function readConfig() {
  const configData = fs.readFileSync("config.json");
  return JSON.parse(configData);
}

// function filterTransactions(transactions, config) {
//   switch (config.filterType) {
//     case "date":
//       const startDate = new Date(config.dateRange.startDate);
//       const endDate =
//         config.dateRange.endDate.toLowerCase() === "latest"
//           ? new Date()
//           : new Date(config.dateRange.endDate);
//       return transactions.filter((tx) => {
//         const txDate = new Date(tx.executionDate);
//         return txDate >= startDate && txDate <= endDate;
//       });

function filterTransactions(transactions, config) {
  switch (config.filterType) {
    case "date":
      const startDate = new Date(config.dateRange.startDate);
      const endDate =
        config.dateRange.endDate.toLowerCase() === "latest"
          ? new Date()
          : new Date(config.dateRange.endDate);
      return transactions.filter((tx) => {
        const txDate = new Date(tx.executionDate);
        return txDate >= startDate && txDate <= endDate;
      });
    case "block":
      const startBlock = parseInt(config.blockRange.startBlock);
      let endBlock =
        config.blockRange.endBlock.toLowerCase() === "latest"
          ? Number.MAX_SAFE_INTEGER
          : parseInt(config.blockRange.endBlock);

      return transactions.filter((tx) => {
        let txBlockNumber = parseInt(tx.blockNumber);
        return txBlockNumber >= startBlock && txBlockNumber <= endBlock;
      });

    default:
      console.error("Invalid filter type in config.json");
      return transactions;
  }
}

async function runReport() {
  try {
    const safes = await readSafesFromCSV("safes.csv");
    const transactions = await fetchAllTransactions(safes);
    const config = readConfig();
    const filteredTransactions = filterTransactions(transactions, config);
    await generateCsvReport(filteredTransactions); // Ensure you pass filteredTransactions here
    console.log("CSV report generated successfully.");
  } catch (error) {
    console.error("Error during the report generation process:", error);
  }
}

runReport();
