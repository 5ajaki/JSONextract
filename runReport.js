const createCsvWriter = require("csv-writer").createObjectCsvWriter;

async function transformDataForCsv(transactions) {
  // Transform the data as needed based on your requirements
  return transactions.map((tx) => ({
    // Example transformation
    transactionHash: tx.transactionHash,
    executionDate: new Date(tx.executionDate).toLocaleDateString(),
    // ... other fields ...
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
    { id: "transactionHash", title: "Transaction Hash" },
    { id: "executionDate", title: "Execution Date" },
    // ... other headers ...
  ];

  // Filename can include timestamp to differentiate between different runs
  const filename = `Transactions_Report_${new Date().toISOString()}.csv`;

  await writeToCsv(filename, transformedData, headers);
  console.log(`CSV file generated: ${filename}`);
}

module.exports = generateCsvReport;
