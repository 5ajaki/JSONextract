const axios = require("axios");
const fs = require("fs");
const config = require("./config.json"); // Load the configuration file

// Function to fetch transactions for a single safe address
async function fetchTransactionsForSafe(safeAddress) {
  let transactions = [];
  let offset = 0;
  const limit = 20;
  let isMoreDataAvailable = true;

  while (isMoreDataAvailable) {
    try {
      const response = await axios.get(
        `https://safe-transaction-mainnet.safe.global/api/v1/safes/${safeAddress}/all-transactions/?offset=${offset}&limit=${limit}&executed=true&queued=true&trusted=true`,
        { headers: { accept: "application/json" } }
      );

      if (
        response.data &&
        response.data.results &&
        response.data.results.length > 0
      ) {
        transactions = transactions.concat(response.data.results);
        offset += response.data.results.length;
      } else {
        isMoreDataAvailable = false;
      }
    } catch (error) {
      console.error(
        "\nError fetching transactions for address " + safeAddress,
        error
      );
      isMoreDataAvailable = false;
    }
  }

  return transactions;
}

function filterTransactionsByDate(transactions, startDate, endDate) {
  return transactions.filter((tx) => {
    const executionDate = new Date(tx.executionDate);
    return executionDate >= startDate && executionDate <= endDate;
  });
}

function filterTransactionsByBlock(transactions, startBlock, endBlock) {
  return transactions.filter((tx) => {
    const blockNumber = parseInt(tx.blockNumber);
    return blockNumber >= startBlock && blockNumber <= endBlock;
  });
}

async function fetchAllTransactions(safeAddresses) {
  const fetchPromises = safeAddresses.map((safeAddress) => {
    return fetchTransactionsForSafe(safeAddress);
  });

  const results = await Promise.all(fetchPromises);

  let allTransactions = [];
  results.forEach((transactions) => {
    allTransactions.push(...transactions);
  });

  // Apply filters based on config
  let filteredTransactions;
  if (config.filterType === "date") {
    const startDate = new Date(config.dateRange.startDate);
    const endDate =
      config.dateRange.endDate === "latest"
        ? new Date()
        : new Date(config.dateRange.endDate);
    filteredTransactions = filterTransactionsByDate(
      allTransactions,
      startDate,
      endDate
    );
  } else if (config.filterType === "block") {
    const startBlock = config.blockRange.startBlock;
    const endBlock =
      config.blockRange.endBlock === "latest"
        ? Number.MAX_SAFE_INTEGER
        : config.blockRange.endBlock;
    filteredTransactions = filterTransactionsByBlock(
      allTransactions,
      startBlock,
      endBlock
    );
  } else {
    console.error("Invalid filter type specified in config.json");
    return;
  }

  // Save the filtered transactions to a JSON file (if needed)
  const structuredData = { results: filteredTransactions };
  fs.writeFileSync(
    "filteredTransactions.json",
    JSON.stringify(structuredData, null, 2)
  );

  return filteredTransactions;
}

module.exports = fetchAllTransactions;
