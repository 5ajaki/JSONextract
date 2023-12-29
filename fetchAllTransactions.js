const axios = require("axios");
const fs = require("fs");

async function fetchAllTransactions(safeAddress) {
  let allTransactions = [];
  let offset = 0;
  const limit = 20;
  let isMoreDataAvailable = true;

  // Display wait message for the impatient among us
  process.stdout.write("Fetching data from Safe API");

  // Create a periodic update to the wait message
  const interval = setInterval(() => {
    process.stdout.write(".");
  }, 400); // Adjust the ms time as needed (250 is a bit hyper)

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
        allTransactions = allTransactions.concat(response.data.results);
        offset += response.data.results.length;
      } else {
        isMoreDataAvailable = false;
      }
    } catch (error) {
      console.error("\nError fetching transactions:", error);
      isMoreDataAvailable = false;
    }
  }
  // Clear the interval and complete the message after fetching is complete
  clearInterval(interval);
  console.log(
    "\nAll transactions have been fetched and saved to allTransactions.json"
  );

  const structuredData = { results: allTransactions };
  fs.writeFileSync(
    "allTransactions.json",
    JSON.stringify(structuredData, null, 2)
  );

  return allTransactions; // Return the fetched transactions
}

module.exports = fetchAllTransactions;
