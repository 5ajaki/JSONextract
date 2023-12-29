const Web3 = require("web3"); // Import Web3 at the top

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
      from_line: 2, // Assuming there's a header
      relax_column_count: true,
    })
  );

  for await (const row of parser) {
    try {
      const checksumAddress = Web3.utils.toChecksumAddress(row[0].trim());
      safes.push(checksumAddress);
    } catch (error) {
      console.error(`Invalid address format: ${row[0].trim()}`, error);
    }
  }

  return safes;
};

// Main function
const multiSafeFeeExtract = async () => {
  const safes = await readSafesFromCSV("safes.csv");
  //  let allTransactions = [];
  let executorSummary = {};

  // for (const safe of safes) {
  //   console.log(`Fetching transactions for safe: ${safe}`);
  //   const transactions = await fetchAllTransactions(safe);
  //   allTransactions.push(...transactions);

  //   transactions.forEach((tx) => {
  //     if (tx.executor && tx.fee) {
  //       const feeInEther = parseFloat(tx.fee) / 1e18; // Convert fee from Wei to Ether
  //       if (!executorSummary[tx.executor]) {
  //         executorSummary[tx.executor] = { totalFee: 0, txCount: 0 };
  //       }
  //       executorSummary[tx.executor].totalFee += feeInEther;
  //       executorSummary[tx.executor].txCount++;
  //     }
  //   });
  // }

  // Load transactions from the existing JSON file
  const loadedTransactions = require("./allTransactions.json");

  // Prepare data for CSV output
  const detailedTransactions = loadedTransactions.map((tx) => ({
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

  // Filter transactions based on the config file
  const config = require("./config.json");

  let filteredTransactions = detailedTransactions;

  switch (config.filterType) {
    case "date":
      const startDate = new Date(config.dateRange.startDate);
      const endDate =
        config.dateRange.endDate.toLowerCase() === "latest"
          ? new Date() // Set to current date for 'latest'
          : new Date(config.dateRange.endDate);

      filteredTransactions = filteredTransactions.filter((tx) => {
        const txDate = new Date(tx.executionDate);
        return txDate >= startDate && txDate <= endDate;
      });
      break;

    case "block":
      const startBlock = config.blockRange.startBlock;
      const endBlock =
        config.blockRange.endBlock.toLowerCase() === "latest"
          ? Number.MAX_SAFE_INTEGER // Set to a very high number for 'latest'
          : config.blockRange.endBlock;

      filteredTransactions = filteredTransactions.filter((tx) => {
        return tx.blockNumber >= startBlock && tx.blockNumber <= endBlock;
      });
      break;

    default:
      console.error("Invalid filter type specified in config.json");
      break;
  }

  const finalFilteredTransactions = filteredTransactions.filter((tx) => {
    const isValidTransaction =
      tx.nonce !== undefined && tx.nonce !== null && !isNaN(tx.fee);
    return isValidTransaction;
  });

  // Function to write data to a CSV file
  const writeToCSV = (data, filename, headers) => {
    const csvWriter = createCsvWriter({ path: filename, header: headers });
    csvWriter
      .writeRecords(data)
      .then(() => console.log(`Written data to ${filename}`));
  };

  loadedTransactions.forEach((tx) => {
    if (tx.executor && tx.fee) {
      const feeInEther = parseFloat(tx.fee) / 1e18; // Convert fee from Wei to Ether
      if (!executorSummary[tx.executor]) {
        executorSummary[tx.executor] = { totalFee: 0, txCount: 0 };
      }
      executorSummary[tx.executor].totalFee += feeInEther;
      executorSummary[tx.executor].txCount++;
    }
  });

  // Writes the two files with only the valid transactions
  writeToCSV(finalFilteredTransactions, "detailedTransactions.csv", [
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
