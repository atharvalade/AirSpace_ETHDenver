#!/bin/bash

# Script to export NFTs from the Flow blockchain
# Usage: ./src/scripts/exportNFTs.sh [--output=<output-file-path>]
# Default output path: src/data/nfts-data-exported.json

# Default output path
OUTPUT_PATH="src/data/nfts-data-exported.json"

# Parse command line arguments
for arg in "$@"; do
  if [[ $arg == --output=* ]]; then
    OUTPUT_PATH="${arg#*=}"
  fi
done

# Create a temporary JavaScript file to run the TypeScript file
TEMP_JS_FILE="export-temp.js"
cat > $TEMP_JS_FILE << 'EOL'
// This is a temporary file to run the TypeScript file
const path = require('path');
const tsconfig = require('./tsconfig.json');
const tsConfigPaths = require('tsconfig-paths');

// Setup the path aliases
const baseUrl = './'; // This is the baseUrl specified in tsconfig.json
const cleanup = tsConfigPaths.register({
  baseUrl,
  paths: tsconfig.compilerOptions.paths
});

// Register ts-node to handle TypeScript files
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    moduleResolution: 'node',
    esModuleInterop: true,
    baseUrl: '.',
    paths: {
      "@/*": ["./src/*"]
    }
  }
});

// Now require the TypeScript file
try {
  require('./src/scripts/getNFTsForListings.ts');
} catch (error) {
  console.error('Error running NFT export:', error);
  process.exit(1);
} finally {
  // Clean up the path registration
  cleanup();
}
EOL

# Install tsconfig-paths if not already installed
echo "Installing tsconfig-paths if needed..."
npm list tsconfig-paths || npm install --no-save tsconfig-paths

# Execute the export process
echo "Starting NFT export process..."
echo "Exporting NFTs to $OUTPUT_PATH..."
echo "Executing NFT export with node and ts-node/register..."
node $TEMP_JS_FILE

# Check if the export was successful
RESULT=$?
rm $TEMP_JS_FILE

if [ $RESULT -eq 0 ]; then
  echo "NFT export completed successfully"
else
  echo "Error during NFT export"
  exit 1
fi 