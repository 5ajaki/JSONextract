const axios = require("axios");
const fs = require("fs");

const fetchAllTransactions = async () => {
  let allTransactions = [];
  let offset = 0;
  const limit = 20; // Adjust based on the API's response limit
  let isMoreDataAvailable = true;

  while (isMoreDataAvailable) {
    try {
      const response = await axios.get(
        `https://safe-transaction-mainnet.safe.global/api/v1/safes/0x91c32893216dE3eA0a55ABb9851f581d4503d39b/all-transactions/?offset=${offset}&limit=${limit}&executed=true&queued=true&trusted=true`,
        {
          headers: { accept: "application/json" },
          // Add CSRF token if needed
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

  // Structure the data with a 'results' field
  const structuredData = {
    results: allTransactions,
  };

  // Save all transactions to a file
  fs.writeFileSync(
    "allTransactions.json",
    JSON.stringify(structuredData, null, 2)
  );
  console.log("All transactions have been saved to allTransactions.json");
};

fetchAllTransactions();
