import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";
import flowConfig from '@/config/flow';
import fs from 'fs';
import path from 'path';

// Transaction to mint an NFT with IPFS metadata
const MINT_NFT_WITH_METADATA_TRANSACTION = `
import NonFungibleToken from ${flowConfig.NON_FUNGIBLE_TOKEN_ADDRESS}
import MetadataViews from ${flowConfig.METADATA_VIEWS_ADDRESS}
import AirSpaceNFT from ${flowConfig.AIRSPACE_NFT_CONTRACT_ADDRESS}

transaction(
  recipientAddress: Address,
  tokenId: UInt64,
  ipfsHash: String,
  title: String,
  name: String,
  description: String,
  propertyAddress: String,
  currentHeight: UInt64,
  maximumHeight: UInt64,
  availableFloors: UInt64,
  price: UFix64,
  latitude: UFix64,
  longitude: UFix64,
  metadataJson: String
) {
  let minterRef: &AirSpaceNFT.NFTMinter
  let recipientCollectionRef: &{NonFungibleToken.CollectionPublic}

  prepare(signer: AuthAccount) {
    // Get the minter reference
    self.minterRef = signer.borrow<&AirSpaceNFT.NFTMinter>(from: AirSpaceNFT.MinterStoragePath)
      ?? panic("Could not borrow minter reference")

    // Get the recipient's collection reference
    self.recipientCollectionRef = getAccount(recipientAddress)
      .getCapability(AirSpaceNFT.CollectionPublicPath)
      .borrow<&{NonFungibleToken.CollectionPublic}>()
      ?? panic("Could not borrow recipient's collection reference")
  }

  execute {
    // Create metadata dictionary
    let metadata: {String: AnyStruct} = {
      "ipfsHash": ipfsHash,
      "title": title,
      "name": name,
      "description": description,
      "latitude": latitude,
      "longitude": longitude,
      "metadataJson": metadataJson // Store the complete JSON metadata
    }
    
    // Mint the NFT with metadata
    self.minterRef.mintNFTWithMetadata(
      recipient: self.recipientCollectionRef,
      tokenId: tokenId,
      propertyAddress: propertyAddress,
      currentHeight: currentHeight,
      maximumHeight: maximumHeight,
      availableFloors: availableFloors,
      price: price,
      metadata: metadata
    )
  }
}
`;

// Function to mint an NFT with metadata
const mintNFTWithMetadata = async (
  recipientAddress: string,
  nftData: {
    tokenId: number,
    ipfsHash: string,
    metadata: {
      title: string,
      name: string,
      description: string,
      attributes: Array<{
        trait_type: string,
        value: string | number
      }>,
      properties: {
        coordinates: {
          latitude: number,
          longitude: number
        }
      }
    }
  }
): Promise<{ transactionId: string, status: number }> => {
  try {
    // Extract property address from attributes
    const propertyAddressAttr = nftData.metadata.attributes.find(attr => attr.trait_type === "Property Address");
    const propertyAddress = propertyAddressAttr ? String(propertyAddressAttr.value) : "";
    
    // Extract other attributes
    const currentHeightAttr = nftData.metadata.attributes.find(attr => attr.trait_type === "Current Height");
    const currentHeight = currentHeightAttr ? Number(currentHeightAttr.value) : 0;
    
    const maximumHeightAttr = nftData.metadata.attributes.find(attr => attr.trait_type === "Maximum Height");
    const maximumHeight = maximumHeightAttr ? Number(maximumHeightAttr.value) : 0;
    
    const availableFloorsAttr = nftData.metadata.attributes.find(attr => attr.trait_type === "Available Floors");
    const availableFloors = availableFloorsAttr ? Number(availableFloorsAttr.value) : 0;
    
    const priceAttr = nftData.metadata.attributes.find(attr => attr.trait_type === "Price");
    const price = priceAttr ? Number(priceAttr.value) : 0;
    
    // Get coordinates
    const latitude = nftData.metadata.properties.coordinates.latitude;
    const longitude = nftData.metadata.properties.coordinates.longitude;

    // Store the complete metadata JSON as a string to preserve the exact format
    const metadataJson = JSON.stringify(nftData.metadata);

    console.log(`Minting NFT #${nftData.tokenId} - ${nftData.metadata.title}`);
    console.log(`Property Address: ${propertyAddress}`);
    console.log(`Current Height: ${currentHeight}, Maximum Height: ${maximumHeight}`);
    console.log(`Available Floors: ${availableFloors}, Price: ${price}`);
    console.log(`Coordinates: ${latitude}, ${longitude}`);
    console.log(`IPFS Hash: ${nftData.ipfsHash}`);
    console.log(`Recipient Address: ${recipientAddress}`);

    // Execute the transaction
    const transactionId = await fcl.mutate({
      cadence: MINT_NFT_WITH_METADATA_TRANSACTION,
      args: (arg: any, t: any) => [
        arg(recipientAddress, t.Address),
        arg(nftData.tokenId, t.UInt64),
        arg(nftData.ipfsHash, t.String),
        arg(nftData.metadata.title, t.String),
        arg(nftData.metadata.name, t.String),
        arg(nftData.metadata.description, t.String),
        arg(propertyAddress, t.String),
        arg(currentHeight, t.UInt64),
        arg(maximumHeight, t.UInt64),
        arg(availableFloors, t.UInt64),
        arg(price.toFixed(8), t.UFix64),
        arg(latitude.toFixed(8), t.UFix64),
        arg(longitude.toFixed(8), t.UFix64),
        arg(metadataJson, t.String)
      ],
      payer: fcl.authz,
      proposer: fcl.authz,
      authorizations: [fcl.authz],
      limit: flowConfig.DEFAULT_GAS_LIMIT
    });

    console.log(`NFT #${nftData.tokenId} Mint Transaction ID:`, transactionId);
    
    // Wait for transaction to be sealed
    const transaction = await fcl.tx(transactionId).onceSealed();
    console.log(`NFT #${nftData.tokenId} Mint Transaction sealed:`, transaction);
    
    return {
      transactionId,
      status: transaction.status
    };
  } catch (error) {
    console.error(`Error minting NFT #${nftData.tokenId}:`, error);
    throw error;
  }
};

// Function to batch mint NFTs
export const batchMintNFTs = async (
  nftsData: {
    data: Array<{
      tokenId: number,
      ipfsHash: string,
      metadata: {
        title: string,
        name: string,
        description: string,
        attributes: Array<{
          trait_type: string,
          value: string | number
        }>,
        properties: {
          coordinates: {
            latitude: number,
            longitude: number
          }
        }
      }
    }>,
    wallet: string
  }
): Promise<Array<{ tokenId: number, transactionId: string, status: number }>> => {
  const results: Array<{ tokenId: number, transactionId: string, status: number }> = [];
  
  // Always use the hardcoded wallet address
  const recipientAddress = flowConfig.WALLET_ADDRESS;
  console.log(`Starting batch mint of ${nftsData.data.length} NFTs to wallet ${recipientAddress}`);
  
  // Process NFTs sequentially to avoid transaction conflicts
  for (const nftData of nftsData.data) {
    try {
      const result = await mintNFTWithMetadata(recipientAddress, nftData);
      results.push({
        tokenId: nftData.tokenId,
        transactionId: result.transactionId,
        status: result.status
      });
      
      // Add a small delay between transactions
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Failed to mint NFT #${nftData.tokenId}:`, error);
      results.push({
        tokenId: nftData.tokenId,
        transactionId: "",
        status: flowConfig.FLOW_TX_STATUS.EXPIRED
      });
    }
  }
  
  console.log("Batch minting completed");
  console.log("Results:", results);
  
  return results;
};

// Function to save NFT data to a local file for later use
export const saveNFTsDataToFile = (
  nftsData: {
    data: Array<{
      tokenId: number,
      ipfsHash: string,
      metadata: any
    }>,
    wallet: string
  },
  filename: string = "nfts-data.json"
): void => {
  try {
    // Ensure the directory exists
    const dirPath = path.dirname(path.join(process.cwd(), filename));
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    const filePath = path.join(process.cwd(), filename);
    fs.writeFileSync(filePath, JSON.stringify(nftsData, null, 2));
    console.log(`NFTs data saved to ${filePath}`);
  } catch (error) {
    console.error("Error saving NFTs data to file:", error);
  }
};

// Function to retrieve NFT data from a file
export const getNFTsDataFromFile = (
  filename: string = "nfts-data.json"
): {
  data: Array<{
    tokenId: number,
    ipfsHash: string,
    metadata: any
  }>,
  wallet: string
} | null => {
  try {
    const filePath = path.join(process.cwd(), filename);
    if (!fs.existsSync(filePath)) {
      console.error(`File ${filePath} does not exist`);
      return null;
    }
    
    const fileData = fs.readFileSync(filePath, 'utf8');
    const nftsData = JSON.parse(fileData);
    console.log(`NFTs data loaded from ${filePath}`);
    return nftsData;
  } catch (error) {
    console.error("Error loading NFTs data from file:", error);
    return null;
  }
};

// Main function to execute the script
const main = async () => {
  // Configure FCL
  fcl.config()
    .put("accessNode.api", flowConfig.FLOW_ACCESS_NODE)
    .put("discovery.wallet", flowConfig.FLOW_WALLET_DISCOVERY)
    .put("app.detail.title", flowConfig.APP_NAME)
    .put("app.detail.icon", flowConfig.APP_ICON)
    .put("0xNonFungibleToken", flowConfig.NON_FUNGIBLE_TOKEN_ADDRESS)
    .put("0xMetadataViews", flowConfig.METADATA_VIEWS_ADDRESS)
    .put("0xAirSpaceNFT", flowConfig.AIRSPACE_NFT_CONTRACT_ADDRESS);
  
  // Use the hardcoded wallet address
  const nftsData = {
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
      {
        "tokenId": 3,
        "ipfsHash": "QmU8jp4JuC2RBhF29Pcfa7pr1S6PBVNGCWd2o6xoUaKJbL",
        "metadata": {
          "title": "Vancouver Harbor View Rights",
          "name": "AirSpace - Vancouver Harbor View Rights",
          "description": "Protect your panoramic view of Vancouver's harbor and North Shore mountains. Strategic location in downtown Vancouver.",
          "attributes": [
            {"trait_type": "Property Address", "value": "1128 West Georgia Street, Vancouver, BC V6E 0A8"},
            {"trait_type": "Current Height", "value": 15},
            {"trait_type": "Maximum Height", "value": 30},
            {"trait_type": "Available Floors", "value": 15},
            {"trait_type": "Price", "value": 375000}
          ],
          "properties": {"coordinates": {"latitude": 49.2827, "longitude": -123.1207}}
        }
      },
      {
        "tokenId": 4,
        "ipfsHash": "QmbYkr6Jy4J8kA5KNBrb34AjukKHNmRNAkBMxMrJYtE22W",
        "metadata": {
          "title": "Miami Beach Oceanfront Rights",
          "name": "AirSpace - Miami Beach Oceanfront Rights",
          "description": "Preserve your ocean view in South Beach Miami. Excellent opportunity to secure views of the Atlantic Ocean.",
          "attributes": [
            {"trait_type": "Property Address", "value": "1100 Collins Avenue, Miami Beach, FL 33139"},
            {"trait_type": "Current Height", "value": 8},
            {"trait_type": "Maximum Height", "value": 20},
            {"trait_type": "Available Floors", "value": 12},
            {"trait_type": "Price", "value": 420000}
          ],
          "properties": {"coordinates": {"latitude": 25.7825, "longitude": -80.134}}
        }
      },
      {
        "tokenId": 5,
        "ipfsHash": "QmchGmwDxuVNEVhS3h5s6i7JejghudE6rs7CvxtPvhKxkA",
        "metadata": {
          "title": "Sydney Opera House View Rights",
          "name": "AirSpace - Sydney Opera House View Rights",
          "description": "Once-in-a-lifetime opportunity to secure air rights with direct views of the Sydney Opera House and Harbor Bridge.",
          "attributes": [
            {"trait_type": "Property Address", "value": "71 Macquarie Street, Sydney NSW 2000"},
            {"trait_type": "Current Height", "value": 12},
            {"trait_type": "Maximum Height", "value": 28},
            {"trait_type": "Available Floors", "value": 16},
            {"trait_type": "Price", "value": 580000}
          ],
          "properties": {"coordinates": {"latitude": -33.8568, "longitude": 151.2153}}
        }
      },
      {
        "tokenId": 6,
        "ipfsHash": "QmZBaAKRXwMqLEWYLMWW9w2BR69mGxkrXCHkmrtzxTK5xW",
        "metadata": {
          "title": "Dubai Marina View Rights",
          "name": "AirSpace - Dubai Marina View Rights",
          "description": "Secure spectacular views of Dubai Marina and the Arabian Gulf. Premium location in the heart of New Dubai.",
          "attributes": [
            {"trait_type": "Property Address", "value": "Dubai Marina, Plot No. JLT-PH2-T2A Dubai, UAE"},
            {"trait_type": "Current Height", "value": 20},
            {"trait_type": "Maximum Height", "value": 45},
            {"trait_type": "Available Floors", "value": 25},
            {"trait_type": "Price", "value": 680000}
          ],
          "properties": {"coordinates": {"latitude": 25.0657, "longitude": 55.1403}}
        }
      }
    ],
    "wallet": flowConfig.WALLET_ADDRESS
  };
  
  // Save NFT data to file for later use
  saveNFTsDataToFile(nftsData, "src/data/nfts-data-original.json");
  
  // Mint the NFTs
  try {
    const results = await batchMintNFTs(nftsData);
    console.log("All NFTs minted successfully!");
    console.log(results);
    
    // Save the results
    const resultsFilePath = path.join(process.cwd(), "src/data/minting-results.json");
    fs.writeFileSync(resultsFilePath, JSON.stringify(results, null, 2));
    console.log(`Results saved to ${resultsFilePath}`);
  } catch (error) {
    console.error("Error during batch minting:", error);
  }
};

// Execute the script if run directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error("Error:", error);
      process.exit(1);
    });
}

export default {
  batchMintNFTs,
  saveNFTsDataToFile,
  getNFTsDataFromFile
}; 