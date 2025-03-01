# AirSpace NFT Minting and Reading Scripts

This directory contains scripts for minting NFTs on the Flow blockchain and reading NFT data for use in the AirSpace UI.

## Prerequisites

Before using these scripts, make sure you have:

1. Node.js and npm installed
2. Flow CLI installed (for deploying contracts)
3. A Flow testnet account with some FLOW tokens
4. The AirSpaceNFT contract deployed to your Flow account

## Scripts Overview

### 1. Batch Mint NFTs

The `batchMintNFTs.ts` script allows you to mint multiple NFTs in a single operation. It takes a JSON file containing NFT data and mints each NFT to the specified wallet address.

### 2. Read NFT Data

The `getNFTsForListings.ts` script allows you to read NFT data from either the blockchain or a local file. This data can be used to display NFTs in the listings page.

### 3. Command-line Interface

The `mintNFTs.js` script provides a command-line interface for minting NFTs. It reads NFT data from a JSON file and executes the batch minting process.

## Usage

### Preparing NFT Data

Create a JSON file with the following structure:

```json
{
  "data": [
    {
      "tokenId": 2,
      "ipfsHash": "QmUhnjFEszhg6Qkk6hQYNQxKK1Ghhn6DRM26CjLXFv18RY",
      "metadata": {
        "title": "Niagara Falls Hotel View Rights",
        "name": "AirSpace - Niagara Falls Hotel View Rights",
        "description": "Secure the pristine view of Niagara Falls by purchasing air rights above the existing hotel structure. Prime location with unobstructed views of the falls.",
        "attributes": [
          {"trait_type": "Property Address", "value": "6650 Niagara Parkway, Niagara Falls, ON L2G 0L0"},
          {"trait_type": "Current Height", "value": 10},
          {"trait_type": "Maximum Height", "value": 25},
          {"trait_type": "Available Floors", "value": 15},
          {"trait_type": "Price", "value": 250000}
        ],
        "properties": {"coordinates": {"latitude": 43.0962, "longitude": -79.0377}}
      }
    },
    // Add more NFTs here...
  ],
  "wallet": "0xa20C96EA7B9AbAe32217EbA25577cDe099039D5D"
}
```

### Minting NFTs from the Command Line

```bash
# Make the script executable
chmod +x mintNFTs.js

# Run the script with default options (reads from nfts-data.json)
./mintNFTs.js

# Run the script with a custom file path
./mintNFTs.js --file=./my-nfts.json

# Run the script with a custom wallet address
./mintNFTs.js --wallet=0x1234567890abcdef

# Run the script with both custom file path and wallet address
./mintNFTs.js --file=./my-nfts.json --wallet=0x1234567890abcdef
```

### Minting NFTs Programmatically

```typescript
import { batchMintNFTs } from './batchMintNFTs';

// NFT data
const nftsData = {
  data: [
    // NFT data here...
  ],
  wallet: "0xa20C96EA7B9AbAe32217EbA25577cDe099039D5D"
};

// Mint NFTs
async function mintNFTs() {
  try {
    const results = await batchMintNFTs(nftsData);
    console.log('Minting results:', results);
  } catch (error) {
    console.error('Error minting NFTs:', error);
  }
}

mintNFTs();
```

### Reading NFT Data for Listings

```typescript
import { getNFTsForListings } from './getNFTsForListings';

// Read NFTs from a wallet address
async function readNFTsFromWallet() {
  const walletAddress = "0xa20C96EA7B9AbAe32217EbA25577cDe099039D5D";
  const nfts = await getNFTsForListings(walletAddress);
  console.log('NFTs from wallet:', nfts);
}

// Read NFTs from a file
async function readNFTsFromFile() {
  const filePath = "nfts-data.json";
  const nfts = await getNFTsForListings(undefined, filePath);
  console.log('NFTs from file:', nfts);
}

// Try both methods
async function readNFTs() {
  const walletAddress = "0xa20C96EA7B9AbAe32217EbA25577cDe099039D5D";
  const filePath = "nfts-data.json";
  const nfts = await getNFTsForListings(walletAddress, filePath);
  console.log('NFTs:', nfts);
}

readNFTs();
```

## Deploying the AirSpaceNFT Contract

Before minting NFTs, you need to deploy the AirSpaceNFT contract to your Flow account. Here's how:

1. Update the contract addresses in the contract:

```cadence
import NonFungibleToken from 0x631e88ae7f1d7c20
import MetadataViews from 0x631e88ae7f1d7c20
```

2. Deploy the contract using the Flow CLI:

```bash
flow project deploy --network=testnet
```

3. Update the contract address in your Flow configuration:

```typescript
// src/config/flow.ts
const flowConfig = {
  // ...
  AIRSPACE_NFT_CONTRACT_ADDRESS: "0xYOUR_CONTRACT_ADDRESS",
  // ...
};
```

## Troubleshooting

### Common Issues

1. **Transaction Error: Could not borrow minter reference**
   - Make sure you're using the account that deployed the contract to mint NFTs
   - Check that the minter resource exists in the correct storage path

2. **Transaction Error: Could not borrow recipient's collection reference**
   - Make sure the recipient account has initialized a collection
   - Use the `setupAccount` function to initialize a collection if needed

3. **Error: Cannot find module**
   - Make sure you've installed all required dependencies
   - Check that the import paths are correct

### Getting Help

If you encounter any issues, please:

1. Check the Flow documentation: https://docs.onflow.org/
2. Join the Flow Discord community: https://discord.gg/flow
3. File an issue in the AirSpace repository 