const fs = require("fs");
const { parse } = require("csv-parse");
const fetchAllTransactions = require("./fetchAllTransactions");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

// Function to read safes from CSV
const readSafesFromCSV = async (filePath) => {
  const safes = [];
  const parser = fs.createReadStream(filePath).pipe(
    parse({
      delimiter: ",",
      from_line: 2, // Use 2 if there's a header, 1 if there's no header
      relax_column_count: true, // This makes the parser more tolerant to varying column counts
    })
  );

  for await (const row of parser) {
    safes.push(row[0].trim()); // Directly pushing the address without conversion
  }

  return safes;
};

// Main function
const multiSafeFeeExtract = async () => {
  const safes = await readSafesFromCSV("safes.csv");
  let allTransactions = [];
  let executorSummary = {};

  for (const safe of safes) {
    console.log(`Fetching transactions for safe: ${safe}`);
    const transactions = await fetchAllTransactions(safe);
    allTransactions.push(...transactions);

    transactions.forEach((tx) => {
      if (tx.executor && tx.fee) {
        const feeInEther = parseFloat(tx.fee) / 1e18; // Convert fee from Wei to Ether
        if (!executorSummary[tx.executor]) {
          executorSummary[tx.executor] = { totalFee: 0, txCount: 0 };
        }
        executorSummary[tx.executor].totalFee += feeInEther;
        executorSummary[tx.executor].txCount++;
      }
    });
  }

  // Prepare data for CSV output
  const detailedTransactions = allTransactions.map((tx) => ({
    nonce: tx.nonce,
    transactionHash: tx.transactionHash,
    executor: tx.executor,
    fee: tx.fee ? parseFloat(tx.fee) / 1e18 : NaN, // Convert fee from Wei to Ether
    executionDate: tx.executionDate,
  }));

  const summaryData = Object.entries(executorSummary).map(
    ([address, data]) => ({
      ENSName: "", // Placeholder for future ENS name resolution
      Address: address,
      Amount: data.totalFee.toFixed(18), // Format the total fee to 18 decimal places
      numberOfTxs: data.txCount,
    })
  );

  // Function to write data to a CSV file
  const writeToCSV = (data, filename, headers) => {
    const csvWriter = createCsvWriter({ path: filename, header: headers });
    csvWriter
      .writeRecords(data)
      .then(() => console.log(`Written data to ${filename}`));
  };

  // Writes the two files
  writeToCSV(detailedTransactions, "detailedTransactions.csv", [
    { id: "nonce", title: "Nonce" },
    { id: "transactionHash", title: "Transaction Hash" },
    { id: "executor", title: "Executor" },
    { id: "fee", title: "Fee (in Ether)" },
    { id: "executionDate", title: "Execution Date" },
  ]);

  writeToCSV(summaryData, "executorSummary.csv", [
    { id: "ENSName", title: "ENS Name" },
    { id: "Address", title: "Address" },
    { id: "Amount", title: "Amount" },
    { id: "numberOfTxs", title: "Number of Transactions" },
  ]);
};

multiSafeFeeExtract();
