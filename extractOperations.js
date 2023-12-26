const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

// Function to convert the JSON data to CSV format for a specific nonce
const jsonToCSV = (data, nonce) => {
  const csvWriter = createCsvWriter({
    path: `operations_nonce_${nonce}.csv`,
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
    .then(() =>
      console.log(`CSV file for nonce ${nonce} was written successfully`)
    );
};

// Read the JSON file
fs.readFile("transactions.json", "utf8", (err, jsonString) => {
  if (err) {
    console.log("Error reading file:", err);
    return;
  }
  try {
    const data = JSON.parse(jsonString);

    // Loop through each nonce and write separate CSV files
    for (let nonce = 72; nonce <= 77; nonce++) {
      const operations = data.results
        .filter((result) => result.nonce === nonce)
        .flatMap((result) =>
          result.dataDecoded.parameters.flatMap((param) =>
            param.valueDecoded.map((valDecoded) => ({
              nonce: result.nonce,
              Address: valDecoded.to,
              Amount: parseInt(valDecoded.value) / 1e18, // Convert from Wei to Eth
            }))
          )
        );

      // Convert JSON to CSV and save for each nonce
      jsonToCSV(operations, nonce);
    }
  } catch (err) {
    console.log("Error parsing JSON string:", err);
  }
});
