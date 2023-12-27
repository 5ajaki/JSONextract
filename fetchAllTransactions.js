const axios = require("axios");
const fs = require("fs");
// const readline = require("readline");

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });

// const prompt = (question) =>
//   new Promise((resolve) => rl.question(question, resolve));

async function fetchAllTransactions(safeAddress) {
  const fetchAllTransactions = async (safeAddress) => {
    let allTransactions = [];
    let offset = 0;
    const limit = 20;
    let isMoreDataAvailable = true;

    while (isMoreDataAvailable) {
      try {
        const response = await axios.get(
          `https://safe-transaction-mainnet.safe.global/api/v1/safes/${safeAddress}/all-transactions/?offset=${offset}&limit=${limit}&executed=true&queued=true&trusted=true`,
          {
            headers: { accept: "application/json" },
          }
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
        console.error("Error fetching transactions:", error);
        isMoreDataAvailable = false;
      }
    }

    const structuredData = { results: allTransactions };
    fs.writeFileSync(
      "allTransactions.json",
      JSON.stringify(structuredData, null, 2)
    );
    console.log("All transactions have been saved to allTransactions.json");
  };
}

module.exports = fetchAllTransactions;
