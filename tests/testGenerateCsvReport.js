const fs = require("fs");
const generateCsvReport = require("../generateCsvReport");

async function readFilteredTransactions(filePath) {
  const rawData = fs.readFileSync(filePath);
  return JSON.parse(rawData).results; // Assuming the structure includes a 'results' key
}

async function testGenerateCsvReport() {
  try {
    const transactions = await readFilteredTransactions(
      "filteredTransactions.json"
    );
    await generateCsvReport(transactions);
    console.log("CSV report generation test completed successfully.");
  } catch (error) {
    console.error("Error during CSV report generation:", error);
  }
}

testGenerateCsvReport();
