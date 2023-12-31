# Safe Tx Fee Report

This repository reads a list of safes and generates two reports of the gass fees paid by the associated executors. It's a simple way for any group or DAO to sum the Tx fees that their executors have paid for over a configurable period of time. The CSVs generated can easliy be inputs back into the safe through CSV Airdrop, Pacel tools, etc.

The list of input safes should be in the root directory as safes.CSV - make sure it's a one column csv file with a header row.

The config.json file allows for the output to be filtered by date or block number. Specify either 'block' or 'date' and then the start/stop values. Use 'latest' in place of a stop value if needed.

## Description

- `runReport.js`: Reads the safes.CSV file and pulls the data from the Safe API to generate the two reports.

## Getting Started

### Dependencies

- Node.js (version 12 or higher recommended)
- NPM packages: `csv-parse`, `csv-writer`, `axios`, `yargs`, and `readline`.

### Installing

Clone the repository:

    git clone https://github.com/5ajaki/JSONextract.git

Install the required NPM packages:

    npm install csv-parse yargs csv-writer axios

### Executing the Scripts

    node runReport.js

#### Output

The output CSV file will look like this:

| Nonce | Transaction Hash                                                   | Executor                                   | Fee (in Ether)      | Execution Date       |
| ----- | ------------------------------------------------------------------ | ------------------------------------------ | ------------------- | -------------------- |
| 77    | 0x8321664039d32d2524c426b6709a921af174fc3c09fc90a353106060f1e6b018 | 0x0B8B1ed2594B36aedbF44DD17674f4686eDFeE6B | 0.1664924208833800  | 2023-12-27T19:01:11Z |
| 76    | 0xe7cb9c289d4d49541659e93a922605e032825d2173cce6d342ddcdb0873680eb | 0x0B8B1ed2594B36aedbF44DD17674f4686eDFeE6B | 0.16211596990406700 | 2023-12-27T18:59:11Z |
| 75    | 0xcdeb7560b519cac7b3a6768ee6b17c10eef000ae05b2e9fa592e6c57c5d99010 | 0x0B8B1ed2594B36aedbF44DD17674f4686eDFeE6B | 0.16279985400684200 | 2023-12-27T18:56:35Z |
| 74    | 0x53fa73de40fce255e71bfd504482497b93a6c72e0583f5ef1fc69d3f12858cbf | 0x0B8B1ed2594B36aedbF44DD17674f4686eDFeE6B | 0.1370680946278040  | 2023-12-27T18:53:23Z |

    node feeExtract.js

#### extractOperations.js

Run the script to extract data from a JSON file (named `transactions.json`) and save it as CSV files:

    node extractOperations.js

#### compareCSV.js

Run the script in default mode:

    node compareCSV.js

For interactive mode with prompts:

    node compareCSV.js -v

#### fetchAllTransactions.js and feeExtract.js

Run the script to fetch all transactions for a specified safe and then extract fee information:

    node feeExtract.js

## Help

If you encounter any issues, check the script for syntax errors or missing dependencies. Ensure Node.js is updated to a recent version.

## Authors

GitHub: [5ajaki](https://github.com/5ajaki)

## Version History

- Initial Release - Hardcoded for ENS Metagov Safe queued Tx comparisons
- v2 - Focus on feeExtract flexibility for use on all Safes
- v3 Multiple inputs and outputs.
- v4 Fully functional

## License

This project is licensed under the MIT License - see the LICENSE.md file for details
