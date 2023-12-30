const axios = require("axios");
const fs = require("fs");

async function fetchTransactionsForSafe(safeAddress) {
  let transactions = [];
  let offset = 0;
  const limit = 20;
  let isMoreDataAvailable = true;

  // Start progress message for each safe address
  console.log(`Fetching data for safe address ${safeAddress}...`);

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
        process.stdout.write("."); // Progress indicator
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

  console.log(" Done."); // Indicate completion for this address
  return transactions;
}

async function fetchAllTransactions(safeAddresses) {
  let allTransactions = [];

  // Loop through each address sequentially
  for (const address of safeAddresses) {
    const transactions = await fetchTransactionsForSafe(address);
    allTransactions.push(...transactions);
  }

  // Saving the aggregated transactions to a JSON file
  const structuredData = { results: allTransactions };
  fs.writeFileSync(
    "allTransactions.json",
    JSON.stringify(structuredData, null, 2)
  );

  return allTransactions;
}

module.exports = fetchAllTransactions;
