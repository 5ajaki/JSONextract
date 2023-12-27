# JSON Extract and CSV Comparison Tool

This repository contains two main JavaScript tools: one for extracting data from JSON files (`extractOperations.js`) and another for comparing CSV files (`compareCSV.js`). The project focuses on handling Ethereum blockchain transaction data.

## Description

- `extractOperations.js`: Extracts operations data from a JSON file and outputs the data into CSV files. It creates a consolidated CSV file with all operations and individual CSV files for each specified nonce.
- `compareCSV.js`: Compares two CSV files for matching and non-matching rows. It supports case-sensitive or case-insensitive comparison and allows for a configurable numerical tolerance in data comparison.

## Getting Started

### Dependencies

- Node.js (version 12 or higher recommended)
- NPM packages: `csv-parse`, `csv-writer`, `yargs`, and `readline` (for interactive mode in `compareCSV.js`).

### Installing

Clone the repository:

    git clone https://github.com/5ajaki/JSONextract.git

Install the required NPM packages:

    npm install csv-parse yargs csv-writer

### Executing the Scripts

#### extractOperations.js

Run the script to extract data from a JSON file (named `transactions.json`) and save it as CSV files:

    node extractOperations.js

#### compareCSV.js

Run the script in default mode:

    node compareCSV.js

For interactive mode with prompts:

    node compareCSV.js -v

## Help

If you encounter any issues, check the script for syntax errors or missing dependencies. Ensure Node.js is updated to a recent version.

## Authors

GitHub: [5ajaki](https://github.com/5ajaki)

## Version History

- Initial Release

## License

This project is licensed under the MIT License - see the LICENSE.md file for details

## Acknowledgments

Special thanks to all contributors and those who provided insights into the Ethereum blockchain data structure.
