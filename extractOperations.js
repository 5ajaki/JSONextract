const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

// Function to convert JSON data to CSV format
const jsonToCSV = (data, fileName) => {
  const csvWriter = createCsvWriter({
    path: fileName,
    header: [
      { id: "token_address", title: "token_address" },
      { id: "receiver", title: "receiver" },
      { id: "amount", title: "amount" },
    ],
  });

  const records = data.map((op) => ({
    token_address: "", // Blank as per requirement
    receiver: op.Address,
    amount: op.Amount,
  }));

  csvWriter
    .writeRecords(records)
    .then(() => console.log(`CSV file ${fileName} was written successfully`));
};

// Read the JSON file
fs.readFile("transactions.json", "utf8", (err, jsonString) => {
  if (err) {
    console.log("Error reading file:", err);
    return;
  }
  try {
    const data = JSON.parse(jsonString);

    // Initialize an array for consolidated operations and for each nonce
    const consolidatedOperations = [];
    const operationsByNonce = {};

    data.results.forEach((result) => {
      if (result.nonce >= 72 && result.nonce <= 77) {
        if (!operationsByNonce[result.nonce]) {
          operationsByNonce[result.nonce] = [];
        }

        result.dataDecoded.parameters.forEach((param) => {
          param.valueDecoded.forEach((valDecoded) => {
            const operation = {
              nonce: result.nonce,
              Address: valDecoded.to,
              Amount: parseInt(valDecoded.value) / 1e18, // Convert from Wei to Eth
            };
            consolidatedOperations.push(operation);
            operationsByNonce[result.nonce].push(operation);
          });
        });
      }
    });

    // Write the consolidated operations to a single file
    jsonToCSV(consolidatedOperations, "consolidated_operations.csv");

    // Write operations for each nonce to separate files
    for (const [nonce, operations] of Object.entries(operationsByNonce)) {
      jsonToCSV(operations, `operations_nonce_${nonce}.csv`);
    }
  } catch (err) {
    console.log("Error parsing JSON string:", err);
  }
});
