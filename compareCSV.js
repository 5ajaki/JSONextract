const fs = require("fs");
const parse = require("csv-parse").parse;
const readline = require("readline");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const argv = yargs(hideBin(process.argv)).option("v", {
  alias: "verbose",
  type: "boolean",
  description: "Run in interactive mode",
  default: false,
}).argv;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const prompt = (question) =>
  new Promise((resolve) => rl.question(question, resolve));

// Function to read and parse a CSV file
const readCSV = (filePath) => {
  const fileContent = fs.readFileSync(filePath, "utf8");
  return new Promise((resolve, reject) => {
    parse(
      fileContent,
      {
        columns: true,
        skip_empty_lines: true,
      },
      (err, output) => {
        if (err) {
          reject(err);
        } else {
          resolve(output);
        }
      }
    );
  });
};

const runInteractiveMode = async () => {
  const caseSensitive = await prompt("Case Sensitive Comparison (Yes/No): ");
  const toleranceLevel = await prompt(
    "Numerical Comparison Tolerance. Enter number of decimal places required for match. Enter 0 for exact match: "
  );
  const showUnmatched = await prompt("Output Unmatched Examples (Yes/No): ");

  rl.close();

  return {
    caseSensitive: caseSensitive.toLowerCase() === "yes",
    tolerance: parseFloat(toleranceLevel),
    showUnmatched: showUnmatched.toLowerCase() === "yes",
  };
};

// Function to compare two arrays of objects and provide detailed comparison for non-matching rows
const compareCSV = (file1, file2, options) => {
  let matchingRowsCount = 0;
  let nonMatchingRowsCount = 0;
  const nonMatchingDetails = [];

  file1.forEach((row1) => {
    const matchIndex = file2.findIndex(
      (row2) =>
        (options.caseSensitive
          ? row1.receiver.trim() === row2.receiver.trim()
          : row1.receiver.trim().toLowerCase() ===
            row2.receiver.trim().toLowerCase()) &&
        Math.abs(parseFloat(row1.amount) - parseFloat(row2.amount)) <
          options.tolerance
    );
    if (matchIndex >= 0) {
      matchingRowsCount++;
    } else {
      nonMatchingRowsCount++;
      if (options.showUnmatched) {
        nonMatchingDetails.push({
          file1Row: row1,
          file2Row:
            file2.find(
              (row2) =>
                row2.receiver.trim().toLowerCase() ===
                row1.receiver.trim().toLowerCase()
            ) || "No matching receiver in file2",
        });
      }
    }
  });

  return {
    matchingRowsCount,
    nonMatchingRowsCount,
    nonMatchingDetails: nonMatchingDetails.slice(0, 5),
  };
};

const compareFiles = async () => {
  try {
    const options = argv.verbose
      ? await runInteractiveMode()
      : { caseSensitive: false, tolerance: 0.0001, showUnmatched: false };

    const file1 = await readCSV("operations_nonce_72.csv");
    const file2 = await readCSV("batch1-DoubleCheck.csv");

    const comparisonResult = compareCSV(file1, file2, options);

    console.log(`Matching Rows: ${comparisonResult.matchingRowsCount}`);
    console.log(`Non-Matching Rows: ${comparisonResult.nonMatchingRowsCount}`);
    if (
      options.showUnmatched &&
      comparisonResult.nonMatchingDetails.length > 0
    ) {
      console.log(
        "Details of Non-Matching Rows:",
        comparisonResult.nonMatchingDetails
      );
    }
  } catch (err) {
    console.error("Error:", err);
  }
};

compareFiles();
