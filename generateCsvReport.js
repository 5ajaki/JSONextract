const createCsvWriter = require("csv-writer").createObjectCsvWriter;

async function transformDataForCsv(transactions) {
  return transactions.map((tx) => ({
    nonce: tx.nonce,
    transactionHash: tx.transactionHash,
    executor: tx.executor,
    fee: tx.fee ? tx.fee / 1e18 : NaN, // Convert fee from Wei to Ether, handle missing fee
    executionDate: tx.executionDate,
    blockNumber: tx.blockNumber,
  }));
}

async function writeToCsv(filename, data, headers) {
  const csvWriter = createCsvWriter({
    path: filename,
    header: headers,
  });

  await csvWriter.writeRecords(data);
}

async function generateCsvReport(transactions) {
  const transformedData = await transformDataForCsv(transactions);

  // Define headers for the CSV file
  const headers = [
    { id: "nonce", title: "Nonce" },
    { id: "transactionHash", title: "Transaction Hash" },
    { id: "executor", title: "Executor" },
    { id: "fee", title: "Fee (in Ether)" },
    { id: "executionDate", title: "Execution Date" },
    { id: "blockNumber", title: "Block Number" },
    // ... other headers ...
  ];

  // Filename can include timestamp to differentiate between different runs
  const filename = `Transactions_Report_${new Date().toISOString()}.csv`;

  await writeToCsv(filename, transformedData, headers);
  console.log(`CSV file generated: ${filename}`);
}

module.exports = generateCsvReport;
