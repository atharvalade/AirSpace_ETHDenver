# AirSpace Flow Integration

This document provides an overview of the Flow blockchain integration for the AirSpace project, which allows users to mint and manage NFTs representing air rights for properties.

## Overview

AirSpace uses the Flow blockchain to mint and manage NFTs that represent air rights for properties. Each NFT contains metadata about the property, including:

- Property address
- Current height
- Maximum height
- Available floors
- Price

## Components

### 1. Flow Context (`src/context/FlowContext.tsx`)

The Flow Context provides authentication and state management for Flow interactions. It includes:

- User authentication with Flow wallet
- Account setup for NFT collection
- Connection and disconnection functions

### 2. Flow NFT Service (`src/services/flowNftService.ts`)

The Flow NFT Service handles NFT-related operations:

- Minting NFTs from listings
- Retrieving NFTs for the current user
- Checking transaction status
- Checking minter capability

### 3. Flow Auth Button (`src/components/Auth/FlowAuthButton.tsx`)

A UI component that allows users to:

- Connect to their Flow wallet
- Disconnect from their Flow wallet
- Set up their account for NFT collection

### 4. AirSpace NFT Contract (`src/contracts/AirSpaceNFT.cdc`)

A Cadence smart contract that defines:

- NFT structure with property metadata
- Collection for storing NFTs
- Minter resource for creating new NFTs
- Events for tracking NFT activities

### 5. My NFTs Page (`src/app/my-nfts/page.tsx`)

A page that displays the user's NFT collection, showing:

- NFT metadata
- Property details
- Links to view NFTs on FlowScan

## Flow Configuration

Flow configuration is stored in `src/config/flow.ts` and includes:

- Flow Access Node API
- Flow Wallet Discovery URL
- Contract addresses
- Gas limits
- Transaction status codes

## UI Elements

The Flow integration includes several UI elements:

- Flow logo (`/public/images/Flow_Logo.png`) used throughout the application
- Flow Auth Button in the header
- Connect wallet modal in the Agreement Dialog
- NFT collection display on the My NFTs page

## Usage

### Connecting to Flow Wallet

Users can connect to their Flow wallet using the Flow Auth Button in the header. Once connected, they can:

- View their Flow address
- Set up their account for NFT collection
- Disconnect from their wallet

### Minting NFTs

When a user clicks "Approve & Mint NFT" on a listing, the following happens:

1. If the user is not connected to Flow, they are prompted to connect
2. The user's account is checked to ensure it's set up for NFT collection
3. If not set up, the user is prompted to set up their account
4. The NFT is minted on the Flow blockchain
5. The user is shown a success message with a link to view the NFT on FlowScan

### Viewing NFTs

Users can view their NFT collection on the "My NFTs" page, which shows:

- All NFTs owned by the user
- Metadata for each NFT
- Links to view NFTs on FlowScan

## Development

### Prerequisites

- Flow CLI
- Flow testnet account
- Flow wallet (e.g., Blocto)

### Deploying the Contract

To deploy the AirSpace NFT contract:

1. Install the Flow CLI
2. Create a Flow testnet account
3. Deploy the contract using the Flow CLI:

```bash
flow project deploy --network=testnet
```

4. Update the contract address in `src/config/flow.ts`

### Testing

To test the Flow integration:

1. Connect to your Flow wallet
2. Set up your account for NFT collection
3. Mint an NFT from a listing
4. View your NFT collection on the "My NFTs" page

## Resources

- [Flow Documentation](https://docs.onflow.org/)
- [Cadence Documentation](https://docs.onflow.org/cadence/)
- [Flow FCL Documentation](https://docs.onflow.org/fcl/)
- [FlowScan Testnet](https://testnet.flowscan.org/)

### Wallet Connection

The Flow integration uses FCL's wallet discovery service, which provides a seamless experience for users to connect with various Flow wallets:

- Blocto
- Dapper Wallet
- Ledger
- Flow Wallet Extension
- And other compatible Flow wallets

When users click "Connect Flow Wallet", they'll see a wallet discovery modal that allows them to choose their preferred wallet. This approach is more secure and compatible with browser security policies, ensuring a smooth connection experience across different browsers. 