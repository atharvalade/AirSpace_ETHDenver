# AirSpace NFT Minting and Retrieval

This project provides scripts for minting NFTs on the Flow blockchain and retrieving them in the exact same JSON format.

## Prerequisites

Before using these scripts, make sure you have:

1. Node.js and npm installed
2. Flow CLI installed (for deploying contracts)
3. A Flow testnet account with some FLOW tokens
4. The AirSpaceNFT contract deployed to your Flow account

## Configuration

The project is configured to use the following wallet address:

```
0x4f50ec69447dbf04
```

Recovery phrase:
```
invest cotton bulb top enough cloth side lion dance permit damage random
```

## Scripts Overview

### Minting NFTs

The `mintNFTs.sh` script allows you to mint NFTs to the Flow blockchain:

```bash
# Make the script executable (if not already)
chmod +x src/scripts/mintNFTs.sh

# Run with default file path (src/data/nfts-data.json)
./src/scripts/mintNFTs.sh

# Run with a custom file path
./src/scripts/mintNFTs.sh --file=path/to/your/nft-data.json
```

### Exporting NFTs

The `exportNFTs.sh` script allows you to retrieve NFTs from the Flow blockchain and export them in the original JSON format:

```bash
# Make the script executable (if not already)
chmod +x src/scripts/exportNFTs.sh

# Run with default output path (src/data/nfts-data-exported.json)
./src/scripts/exportNFTs.sh

# Run with a custom output path
./src/scripts/exportNFTs.sh --output=path/to/your/output.json
```

## NFT Data Format

The NFT data should be in the following format:

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
  "wallet": "0x4f50ec69447dbf04"
}
```

## File Structure

- `src/data/nfts-data.json`: The input NFT data file
- `src/data/nfts-data-backup.json`: A backup of the input NFT data
- `src/data/nfts-data-minted.json`: The NFT data after minting
- `src/data/minting-results.json`: The results of the minting process
- `src/data/nfts-data-exported.json`: The exported NFT data in the original format
- `src/data/nfts-data-retrieved.json`: The NFT data retrieved from the blockchain

## Troubleshooting

### Common Issues

- **Transaction Errors**: If you encounter transaction errors, check that your Flow account has sufficient funds and that the contract is properly deployed.
- **Module Not Found Errors**: If you see errors about modules not being found, make sure you have installed all dependencies with `npm install`.
- **Permission Denied**: If you get "Permission denied" when trying to run the scripts, make sure they are executable with `chmod +x src/scripts/*.sh`.

### Getting Help

If you encounter any issues, please:

1. Check the Flow documentation: https://docs.onflow.org/
2. Join the Flow Discord community: https://discord.gg/flow
3. File an issue in the AirSpace repository 