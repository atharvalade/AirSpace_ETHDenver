# AirSpace: Blockchain-Powered Air Rights Marketplace

![AirSpace Logo]

AirSpace is the first blockchain-powered marketplace for buying, selling, and renting air rights. We're unlocking a multi-trillion dollar asset class by enabling property owners to tokenize the valuable space above their buildings, while helping hotels, developers, and businesses protect their views and secure development opportunities. Using verifiable credentials and privacy technology, we've transformed a complex legal process into a transparent, accessible marketplace.

## 🚀 Overview

Air rights represent the legal right to use, develop, or control the empty space above a property. These rights are traditionally difficult to trade due to complex legal processes and lack of transparency. AirSpace solves this by:

1. **Tokenizing Air Rights**: Converting legal air rights into NFTs on the Flow blockchain
2. **Creating a Marketplace**: Enabling easy buying, selling, and renting of these rights
3. **Ensuring Verification**: Using zkSync and verifiable credentials to validate ownership
4. **Simplifying Transactions**: Streamlining a complex legal process into a user-friendly platform

## 🛠️ Technology Stack

AirSpace leverages cutting-edge blockchain and Web3 technologies:

### Flow Blockchain & Cadence
- **NFT Minting**: Air rights are represented as NFTs on the Flow blockchain
- **Smart Contracts**: Written in Cadence, Flow's resource-oriented programming language
- **Metadata Storage**: Comprehensive property details stored on-chain
- **Transaction Management**: Secure and efficient transaction processing

### zkSync & Zero-Knowledge Proofs
- **zkSync Era**: Layer 2 scaling solution for Ethereum
- **Passkey Authentication**: Secure wallet connection without seed phrases
- **Smart Accounts**: Each user gets a smart account on zkSync Era

### zkVerify
- **Zero-Knowledge Verification**: Verify property details without revealing sensitive information
- **Proof Generation**: Create cryptographic proofs using the Groth16 proving system
- **Verification System**: Validate proofs on-chain for trustless verification

### Verifiable Credentials
- **Humanity Protocol**: Verify real-world identity while preserving privacy
- **Credential Issuance**: Issue verifiable credentials for property ownership
- **Credential Verification**: Validate credentials without compromising privacy

### Frontend & User Experience
- **Next.js**: React framework for the web application
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Framer Motion**: Animation library for smooth transitions
- **Mapbox**: Interactive maps for property visualization

## 🏗️ Project Structure

```
AirSpace/
├── src/
│   ├── app/                  # Next.js app directory
│   │   ├── my-nfts/          # NFT collection display
│   │   ├── verify/           # Verification interface
│   │   └── listings/         # Air rights listings
│   ├── components/           # Reusable UI components
│   ├── contracts/            # Blockchain smart contracts
│   │   ├── AirSpaceNFT.cdc   # Flow NFT contract
│   │   └── ZkSyncETHTransfer.sol # zkSync contract
│   ├── context/              # React context providers
│   ├── services/             # API and blockchain services
│   │   ├── flowNftService.ts # Flow NFT operations
│   │   ├── zkVerifyService.ts # ZK verification
│   │   └── humanityProtocol.ts # Verifiable credentials
│   └── scripts/              # Utility scripts
│       ├── mintNFTs.sh       # NFT minting script
│       └── exportNFTs.sh     # NFT export script
├── public/                   # Static assets
└── package.json              # Project dependencies
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- Flow CLI (for contract deployment)
- Flow testnet account
- zkSync Era Sepolia testnet account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/atharvalade/AirSpace_ETHDenver.git
   cd AirSpace_ETHDenver
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys and configuration
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Flow Wallet Configuration

AirSpace uses the following Flow wallet address for testing:
```
0x4f50ec69447dbf04
```

## 🔄 Core Workflows

### Minting Air Rights NFTs

Property owners can tokenize their air rights by:

1. Creating a listing with property details
2. Verifying ownership through verifiable credentials
3. Generating a zero-knowledge proof of property details
4. Minting an NFT on the Flow blockchain

```bash
# Mint NFTs from JSON data
npm run mint-nfts
```

### Buying Air Rights

Developers and businesses can purchase air rights by:

1. Browsing available listings
2. Connecting their Flow wallet
3. Verifying their identity
4. Completing the purchase transaction

### Verifying Ownership

All air rights can be verified using:

1. Zero-knowledge proofs for privacy-preserving verification
2. On-chain verification of NFT ownership
3. Verifiable credentials for real-world identity verification

```bash
# Export and verify NFTs
npm run export-nfts
```

## 🧪 Zero-Knowledge Verification

AirSpace uses zkVerify for privacy-preserving verification:

1. **Generate Proof**: Create a ZK proof of property details
2. **Verify Proof**: Validate the proof without revealing sensitive information
3. **On-Chain Verification**: Store verification results on the blockchain

## 📜 Smart Contracts

### AirSpaceNFT (Flow)

The AirSpaceNFT contract defines the structure for air rights NFTs:

```cadence
pub resource NFT: NonFungibleToken.INFT, MetadataViews.Resolver {
    pub let id: UInt64
    pub let propertyAddress: String
    pub let currentHeight: UInt64
    pub let maximumHeight: UInt64
    pub let availableFloors: UInt64
    pub let price: UFix64
    pub let mintedAt: UFix64
    
    // ... implementation
}
```

### ZkSyncETHTransfer (zkSync Era)

The ZkSyncETHTransfer contract handles ETH transfers on zkSync Era:

```solidity
contract ZkSyncETHTransfer {
    event Transfer(address indexed from, address indexed to, uint256 amount);
    
    // ... implementation
}
```

## 🔐 Authentication

AirSpace offers multiple authentication methods:

1. **Flow Wallet**: Connect using FCL (Flow Client Library)
2. **zkSync SSO**: Passkey authentication without seed phrases
3. **Verifiable Credentials**: Identity verification through Humanity Protocol

## 📊 Data Format

Air rights NFTs use the following data format:

```json
{
  "tokenId": 2,
  "ipfsHash": "QmUhnjFEszhg6Qkk6hQYNQxKK1Ghhn6DRM26CjLXFv18RY",
  "metadata": {
    "title": "Niagara Falls Hotel View Rights",
    "name": "AirSpace - Niagara Falls Hotel View Rights",
    "description": "Secure the pristine view of Niagara Falls by purchasing air rights above the existing hotel structure.",
    "attributes": [
      {"trait_type": "Property Address", "value": "6650 Niagara Parkway, Niagara Falls, ON L2G 0L0"},
      {"trait_type": "Current Height", "value": 10},
      {"trait_type": "Maximum Height", "value": 25},
      {"trait_type": "Available Floors", "value": 15},
      {"trait_type": "Price", "value": 250000}
    ],
    "properties": {"coordinates": {"latitude": 43.0962, "longitude": -79.0377}}
  }
}
```


## 🌐 Resources

- [Flow Documentation](https://docs.onflow.org/)
- [zkSync Documentation](https://docs.zksync.io/)
- [Humanity Protocol](https://humanityprotocol.com/)
- [Verifiable Credentials](https://www.w3.org/TR/vc-data-model/)

## 📧 Contact

For questions or support, please contact me at ladeatharva@gmail.com

---

Built with ❤️ at ETHDenver 2025 