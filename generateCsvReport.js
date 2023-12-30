const createCsvWriter = require("csv-writer").createObjectCsvWriter;

async function transformDataForCsv(transactions) {
  return transactions
    .filter(
      (tx) => tx.nonce !== undefined && tx.nonce !== "" && !isNaN(tx.nonce)
    ) // Updated filter condition
    .map((tx) => ({
      nonce: tx.nonce,
      transactionHash: tx.transactionHash,
      executor: tx.executor,
      fee: tx.fee ? tx.fee / 1e18 : NaN,
      executionDate: tx.executionDate,
      blockNumber: tx.blockNumber,
    }));
}
function aggregateExecutorSummary(transactions) {
  const summary = {};

  transactions.forEach((tx) => {
    if (tx.executor && !isNaN(tx.fee)) {
      if (!summary[tx.executor]) {
        summary[tx.executor] = { totalFee: 0, txCount: 0 };
      }
      const feeInEther = parseFloat(tx.fee); // Assuming fee is already in Ether
      summary[tx.executor].totalFee += feeInEther;
      summary[tx.executor].txCount += 1;
    }
  });

  for (const executor in summary) {
    summary[executor].totalFee = summary[executor].totalFee.toFixed(18); // Format fee to 18 decimal places
  }

  return summary;
}

function prepareSummaryDataForCsv(summary) {
  return Object.entries(summary).map(([address, data]) => ({
    ENSName: "", // Placeholder for now
    Address: address,
    Amount: data.totalFee,
    numberOfTxs: data.txCount,
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

  // Define headers for the detailed transactions CSV file
  const detailedHeaders = [
    { id: "nonce", title: "Nonce" },
    { id: "transactionHash", title: "Transaction Hash" },
    { id: "executor", title: "Executor" },
    { id: "fee", title: "Fee (in Ether)" },
    { id: "executionDate", title: "Execution Date" },
    { id: "blockNumber", title: "Block Number" },
  ];

  // Generate detailed transactions CSV file
  const detailedFilename = "detailedTransactions.csv";
  await writeToCsv(detailedFilename, transformedData, detailedHeaders);
  console.log(`CSV file generated: ${detailedFilename}`);

  // Generate executor summary CSV file
  const executorSummary = aggregateExecutorSummary(transformedData);
  const summaryData = prepareSummaryDataForCsv(executorSummary);
  const summaryHeaders = [
    { id: "ENSName", title: "ENS Name" },
    { id: "Address", title: "Address" },
    { id: "Amount", title: "Amount" },
    { id: "numberOfTxs", title: "Number of Transactions" },
  ];
  const summaryFilename = "executorSummary.csv";
  await writeToCsv(summaryFilename, summaryData, summaryHeaders);

  console.log(`Executor summary CSV file generated: ${summaryFilename}`);
}

module.exports = generateCsvReport;
