const readline = require("readline");
const fetchAllTransactions = require("./fetchAllTransactions");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const fs = require("fs");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const prompt = (question) =>
  new Promise((resolve) => rl.question(question, resolve));

const main = async () => {
  const safeAddress = await prompt("Enter the safe address: ");
  rl.close();

  await fetchAllTransactions(safeAddress); // Fetch transactions with the provided address

  // Extract the first six characters of the safe address
  const shortSafeAddress = safeAddress.slice(0, 6);

  // Get the current date and time in ISO format
  const currentDate = new Date().toISOString();

  // Construct the filename
  const filename = `feeData-${shortSafeAddress}-${currentDate}.csv`;

  // Function to convert the transaction data to CSV format
  function transactionsToCSV(data, fileName) {
    const csvWriter = createCsvWriter({
      path: fileName,
      header: [
        { id: "nonce", title: "Nonce" },
        { id: "transactionHash", title: "Transaction Hash" },
        { id: "executor", title: "Executor" },
        { id: "fee", title: "Fee (in Ether)" },
        { id: "executionDate", title: "Execution Date" },
      ],
    });

    const filteredData = data.filter((record) => {
      // Check if any key value in the record is undefined, null, or NaN
      return !(
        record.nonce === undefined ||
        //      record.transactionHash === undefined ||
        //     record.executor === undefined ||
        isNaN(record.fee)
      );
    });

    csvWriter
      .writeRecords(filteredData)
      .then(() => console.log(`CSV file ${fileName} was written successfully`));
  }

  // Read the JSON file
  fs.readFile("allTransactions.json", "utf8", (err, jsonString) => {
    if (err) {
      console.log("Error reading file:", err);
      return;
    }
    try {
      const transactions = JSON.parse(jsonString);

      // Extract the required data and convert fee from Wei to Ether
      const transactionData = transactions.results.map((transaction) => ({
        nonce: transaction.nonce,
        transactionHash: transaction.transactionHash,
        executor: transaction.executor,
        fee: transaction.fee ? transaction.fee / 1e18 : NaN, // Convert fee from Wei to Ether, handle missing fee
        executionDate: transaction.executionDate,
      }));

      // Write the transaction data to a CSV file
      transactionsToCSV(transactionData, filename);
    } catch (err) {
      console.log("Error parsing JSON string:", err);
    }
  });
};

main();
