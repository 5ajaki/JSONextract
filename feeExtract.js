const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

// Function to convert the transaction data to CSV format
const transactionsToCSV = (data, fileName) => {
  const csvWriter = createCsvWriter({
    path: fileName,
    header: [
      { id: "nonce", title: "Nonce" },
      { id: "transactionHash", title: "Transaction Hash" },
      { id: "executor", title: "Executor" },
      { id: "fee", title: "Fee" },
    ],
  });

  csvWriter
    .writeRecords(data)
    .then(() => console.log(`CSV file ${fileName} was written successfully`));
};

// Read the JSON file
fs.readFile("allTransactions.json", "utf8", (err, jsonString) => {
  if (err) {
    console.log("Error reading file:", err);
    return;
  }
  try {
    const transactions = JSON.parse(jsonString);

    // Extract the required data and convert fee from Wei to Ether
    const transactionData = transactions.results.map((transaction) => ({
      nonce: transaction.nonce,
      transactionHash: transaction.transactionHash,
      executor: transaction.executor,
      fee: transaction.fee / 1e18, // Convert fee from Wei to Ether
    }));

    // Write the transaction data to a CSV file
    transactionsToCSV(transactionData, "transactionsWFee.csv");
  } catch (err) {
    console.log("Error parsing JSON string:", err);
  }
});
