const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const readTransactions = () => {
  const data = fs.readFileSync("./allTransactions.json", "utf8");
  const jsonData = JSON.parse(data);

  console.log("Data type:", typeof jsonData);
  console.log("Is array:", Array.isArray(jsonData));
  console.log("First few items:", jsonData.slice(0, 5));
  console.log(
    "JSON data content:",
    JSON.stringify(jsonData, null, 2).slice(0, 500)
  ); // Prints the first 500 characters of the JSON content

  return jsonData;
};

// Main function to process transactions and write to CSV
const processTransactions = () => {
  const transactions = readTransactions();
  let executorSummary = {};

  // Detailed Transactions
  const detailedTransactions = transactions.map((tx) => ({
    nonce: tx.nonce,
    transactionHash: tx.transactionHash,
    executor: tx.executor,
    fee: tx.fee ? parseFloat(tx.fee) / 1e18 : NaN, // Convert fee from Wei to Ether
    executionDate: tx.executionDate,
  }));

  // Summary Data
  detailedTransactions.forEach((tx) => {
    if (tx.executor && !isNaN(tx.fee)) {
      if (!executorSummary[tx.executor]) {
        executorSummary[tx.executor] = { totalFee: 0, txCount: 0 };
      }
      executorSummary[tx.executor].totalFee += tx.fee;
      executorSummary[tx.executor].txCount++;
    }
  });

  const summaryData = Object.entries(executorSummary).map(
    ([executor, data]) => ({
      executor: executor,
      totalFee: data.totalFee.toFixed(18),
      txCount: data.txCount,
    })
  );

  // Write to CSV files
  writeToCSV(detailedTransactions, "detailedTransactions.csv", [
    { id: "nonce", title: "Nonce" },
    { id: "transactionHash", title: "Transaction Hash" },
    { id: "executor", title: "Executor" },
    { id: "fee", title: "Fee (in Ether)" },
    { id: "executionDate", title: "Execution Date" },
  ]);

  writeToCSV(summaryData, "executorSummary.csv", [
    { id: "executor", title: "Executor" },
    { id: "totalFee", title: "Total Fee (in Ether)" },
    { id: "txCount", title: "Number of Transactions" },
  ]);
};

// Function to write data to a CSV file
const writeToCSV = (data, filename, headers) => {
  const csvWriter = createCsvWriter({ path: filename, header: headers });
  csvWriter
    .writeRecords(data)
    .then(() => console.log(`Written data to ${filename}`))
    .catch((err) => console.error(`Error writing to ${filename}:`, err));
};

processTransactions();
