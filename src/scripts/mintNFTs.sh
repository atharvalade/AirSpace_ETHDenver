#!/bin/bash

# Script to mint NFTs from a JSON file
# Usage: ./src/scripts/mintNFTs.sh [--file=<path-to-json-file>]
# Default file path: src/data/nfts-data.json

# Default file path
FILE_PATH="src/data/nfts-data.json"

# Parse command line arguments
for arg in "$@"; do
  if [[ $arg == --file=* ]]; then
    FILE_PATH="${arg#*=}"
  fi
done

# Check if the file exists
if [ ! -f "$FILE_PATH" ]; then
  echo "Error: File $FILE_PATH does not exist"
  exit 1
fi

# Create backup of the NFT data
BACKUP_PATH="src/data/nfts-data-backup.json"
cp "$FILE_PATH" "$BACKUP_PATH"
echo "Saved backup of NFT data to $BACKUP_PATH"

# Save the NFT data for minting
MINTED_DATA_PATH="src/data/nfts-data-minted.json"
cp "$FILE_PATH" "$MINTED_DATA_PATH"
echo "Saved NFT data for minting to $MINTED_DATA_PATH"

# Create a temporary JavaScript file to run the TypeScript file
TEMP_JS_FILE="mint-temp.js"
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
  require('./src/scripts/batchMintNFTs.ts');
} catch (error) {
  console.error('Error running batch minting:', error);
  process.exit(1);
} finally {
  // Clean up the path registration
  cleanup();
}
EOL

# Install tsconfig-paths if not already installed
echo "Installing tsconfig-paths if needed..."
npm list tsconfig-paths || npm install --no-save tsconfig-paths

# Execute the batch minting process
echo "Starting batch minting process..."
echo "Executing batch minting with node and ts-node/register..."
node $TEMP_JS_FILE

# Check if the minting was successful
RESULT=$?
rm $TEMP_JS_FILE

if [ $RESULT -eq 0 ]; then
  echo "Batch minting completed successfully"
else
  echo "Error during batch minting"
  exit 1
fi 