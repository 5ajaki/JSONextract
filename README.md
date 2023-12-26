# CSV Comparison Tool

This repository contains JavaScript scripts designed to compare CSV files and extract data from JSON files. The project includes two main scripts: one for comparing CSV files (`compareCSV.js`) and another for extracting operations from a JSON file and converting them to CSV format (`extractOperations.js`).

## Description

- `compareCSV.js`: Compares two CSV files and identifies matching and non-matching rows based on user-defined criteria. It supports case-sensitive/case-insensitive comparison and allows for numerical tolerance in data comparison.
- `extractOperations.js`: Extracts operations data from a JSON file (specific to Ethereum blockchain transactions) and saves them in separate CSV files based on the transaction nonce.

## Getting Started

### Dependencies

- Node.js (v12 or higher recommended)
- NPM packages: `csv-parse` and `yargs` for `compareCSV.js`, `csv-writer` for `extractOperations.js`.

### Installing

Clone the repository:

```bash
git clone **repo address ends with .git***
