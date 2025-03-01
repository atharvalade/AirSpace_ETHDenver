import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";
import flowConfig from '@/config/flow';
import { NFT } from "@/types/nft";
import fs from 'fs';
import path from 'path';

// Script to get NFTs with metadata for a specific wallet
const GET_NFTS_WITH_METADATA_SCRIPT = `
import NonFungibleToken from ${flowConfig.NON_FUNGIBLE_TOKEN_ADDRESS}
import MetadataViews from ${flowConfig.METADATA_VIEWS_ADDRESS}
import AirSpaceNFT from ${flowConfig.AIRSPACE_NFT_CONTRACT_ADDRESS}

pub fun main(address: Address): [AnyStruct] {
  let account = getAccount(address)
  
  let collection = account
    .getCapability(AirSpaceNFT.CollectionPublicPath)
    .borrow<&{MetadataViews.ResolverCollection}>()
    ?? panic("Could not borrow capability from public collection")
  
  let ids = collection.getIDs()
  
  let nfts: [AnyStruct] = []
  
  for id in ids {
    let nft = collection.borrowViewResolver(id: id)
    
    // Get the basic display information
    let display = nft.resolveView(Type<MetadataViews.Display>())! as! MetadataViews.Display
    
    // Try to get the NFT reference to access additional fields
    let airSpaceNFT = account
      .getCapability(AirSpaceNFT.CollectionPublicPath)
      .borrow<&{AirSpaceNFT.AirSpaceNFTCollectionPublic}>()!
      .borrowAirSpaceNFT(id: id)!
    
    // Get IPFS data if available
    let ipfsFile = nft.resolveView(Type<MetadataViews.IPFSFile>()) as? MetadataViews.IPFSFile
    let ipfsHash = ipfsFile?.cid ?? airSpaceNFT.ipfsHash
    
    // Get the original metadata JSON if available
    let metadataJson = airSpaceNFT.metadata["metadataJson"] as? String ?? ""
    
    // Create NFT data object
    let nftData = {
      "id": id,
      "name": display.name,
      "title": airSpaceNFT.metadata["title"] as? String ?? display.name,
      "description": display.description,
      "thumbnail": display.thumbnail.uri(),
      "propertyAddress": airSpaceNFT.propertyAddress,
      "currentHeight": airSpaceNFT.currentHeight,
      "maximumHeight": airSpaceNFT.maximumHeight,
      "availableFloors": airSpaceNFT.availableFloors,
      "price": airSpaceNFT.price,
      "ipfsHash": ipfsHash,
      "owner": address,
      "latitude": airSpaceNFT.metadata["latitude"] as? UFix64 ?? 0.0,
      "longitude": airSpaceNFT.metadata["longitude"] as? UFix64 ?? 0.0,
      "metadataJson": metadataJson
    }
    
    nfts.append(nftData)
  }
  
  return nfts
}
`;

// Function to get NFTs with metadata for a specific wallet
export const getNFTsWithMetadataForWallet = async (address: string): Promise<NFT[]> => {
  try {
    console.log(`Getting NFTs with metadata for wallet ${address}`);
    
    const result = await fcl.query({
      cadence: GET_NFTS_WITH_METADATA_SCRIPT,
      args: (arg: any, t: any) => [arg(address, t.Address)]
    });
    
    console.log(`Found ${result.length} NFTs for wallet ${address}`);
    
    // Transform the result to match the NFT type
    const nfts: NFT[] = result.map((nft: any) => {
      // Try to parse the original metadata JSON if available
      let originalMetadata = null;
      if (nft.metadataJson) {
        try {
          originalMetadata = JSON.parse(nft.metadataJson);
        } catch (error) {
          console.error(`Error parsing metadata JSON for NFT ${nft.id}:`, error);
        }
      }
      
      return {
        id: nft.id.toString(),
        name: nft.name,
        title: nft.title,
        description: nft.description,
        thumbnail: nft.thumbnail,
        propertyAddress: nft.propertyAddress,
        currentHeight: Number(nft.currentHeight),
        maximumHeight: Number(nft.maximumHeight),
        availableFloors: Number(nft.availableFloors),
        price: Number(nft.price),
        token_id: Number(nft.id),
        contract_address: flowConfig.AIRSPACE_NFT_CONTRACT_ADDRESS,
        owner: nft.owner,
        metadata: originalMetadata || {
          ipfsHash: nft.ipfsHash
        },
        latitude: Number(nft.latitude),
        longitude: Number(nft.longitude),
        image_url: `https://ipfs.io/ipfs/${nft.ipfsHash}`,
        original_format: originalMetadata ? true : false
      };
    });
    
    // Save the NFTs data in the original format
    saveNFTsInOriginalFormat(nfts, address);
    
    return nfts;
  } catch (error) {
    console.error(`Error getting NFTs with metadata for wallet ${address}:`, error);
    return [];
  }
};

// Function to save NFTs in the original format
const saveNFTsInOriginalFormat = (nfts: NFT[], walletAddress: string): void => {
  try {
    // Filter NFTs that have the original format
    const nftsWithOriginalFormat = nfts.filter(nft => nft.original_format);
    
    if (nftsWithOriginalFormat.length === 0) {
      console.log('No NFTs with original format found');
      return;
    }
    
    // Transform the NFTs to the original format
    const originalFormatData = {
      data: nftsWithOriginalFormat.map(nft => ({
        tokenId: nft.token_id,
        ipfsHash: nft.metadata?.ipfsHash || '',
        metadata: nft.metadata
      })),
      wallet: walletAddress
    };
    
    // Save the data to a file
    const filePath = path.join(process.cwd(), 'src/data/nfts-data-retrieved.json');
    fs.writeFileSync(filePath, JSON.stringify(originalFormatData, null, 2));
    console.log(`NFTs data in original format saved to ${filePath}`);
  } catch (error) {
    console.error('Error saving NFTs in original format:', error);
  }
};

// Function to get NFTs from a local file
export const getNFTsFromFile = (filePath: string): NFT[] => {
  try {
    // Read the file
    const fullPath = path.resolve(process.cwd(), filePath);
    const fileData = fs.readFileSync(fullPath, 'utf8');
    const jsonData = JSON.parse(fileData);
    
    // Transform the data to match the NFT type
    const nfts: NFT[] = jsonData.data.map((nft: any) => {
      // Extract property address from attributes
      const propertyAddressAttr = nft.metadata.attributes.find((attr: any) => attr.trait_type === "Property Address");
      const propertyAddress = propertyAddressAttr ? String(propertyAddressAttr.value) : "";
      
      // Extract other attributes
      const currentHeightAttr = nft.metadata.attributes.find((attr: any) => attr.trait_type === "Current Height");
      const currentHeight = currentHeightAttr ? Number(currentHeightAttr.value) : 0;
      
      const maximumHeightAttr = nft.metadata.attributes.find((attr: any) => attr.trait_type === "Maximum Height");
      const maximumHeight = maximumHeightAttr ? Number(maximumHeightAttr.value) : 0;
      
      const availableFloorsAttr = nft.metadata.attributes.find((attr: any) => attr.trait_type === "Available Floors");
      const availableFloors = availableFloorsAttr ? Number(availableFloorsAttr.value) : 0;
      
      const priceAttr = nft.metadata.attributes.find((attr: any) => attr.trait_type === "Price");
      const price = priceAttr ? Number(priceAttr.value) : 0;
      
      return {
        id: nft.tokenId.toString(),
        name: nft.metadata.name,
        title: nft.metadata.title,
        description: nft.metadata.description,
        thumbnail: `https://ipfs.io/ipfs/${nft.ipfsHash}`,
        propertyAddress,
        currentHeight,
        maximumHeight,
        availableFloors,
        price,
        token_id: nft.tokenId,
        contract_address: flowConfig.AIRSPACE_NFT_CONTRACT_ADDRESS,
        owner: jsonData.wallet,
        metadata: nft.metadata,
        latitude: nft.metadata.properties.coordinates.latitude,
        longitude: nft.metadata.properties.coordinates.longitude,
        image_url: `https://ipfs.io/ipfs/${nft.ipfsHash}`,
        original_format: true
      };
    });
    
    // Save the NFTs data in the original format
    saveNFTsInOriginalFormat(nfts, jsonData.wallet);
    
    return nfts;
  } catch (error) {
    console.error(`Error reading NFTs from file:`, error);
    return [];
  }
};

// Function to get the original JSON format of the NFTs
export const getOriginalNFTsFormat = (nfts: NFT[], walletAddress: string = flowConfig.WALLET_ADDRESS): any => {
  const originalFormat = {
    data: nfts.map(nft => ({
      tokenId: nft.token_id,
      ipfsHash: nft.metadata?.ipfsHash || '',
      metadata: nft.metadata
    })),
    wallet: walletAddress
  };
  
  return originalFormat;
};

// Main function to get NFTs for listings
export const getNFTsForListings = async (walletAddress?: string, filePath?: string): Promise<NFT[]> => {
  // Default to the hardcoded wallet address if not provided
  const recipientAddress = walletAddress || flowConfig.WALLET_ADDRESS;
  
  // If a file path is provided, try to read from the file first
  if (filePath) {
    try {
      const nftsFromFile = getNFTsFromFile(filePath);
      if (nftsFromFile.length > 0) {
        console.log(`Found ${nftsFromFile.length} NFTs from file`);
        return nftsFromFile;
      }
    } catch (error) {
      console.error(`Error reading NFTs from file:`, error);
    }
  }
  
  // Try to get NFTs from the blockchain
  try {
    const nftsFromBlockchain = await getNFTsWithMetadataForWallet(recipientAddress);
    if (nftsFromBlockchain.length > 0) {
      console.log(`Found ${nftsFromBlockchain.length} NFTs from blockchain`);
      return nftsFromBlockchain;
    }
  } catch (error) {
    console.error(`Error getting NFTs from blockchain:`, error);
  }
  
  // If no NFTs are found, return an empty array
  return [];
};

// Function to export NFTs in the original JSON format
export const exportNFTsToOriginalFormat = async (walletAddress?: string, outputFilePath?: string): Promise<boolean> => {
  try {
    const recipientAddress = walletAddress || flowConfig.WALLET_ADDRESS;
    const nfts = await getNFTsForListings(recipientAddress);
    
    if (nfts.length === 0) {
      console.error('No NFTs found to export');
      return false;
    }
    
    const originalFormat = getOriginalNFTsFormat(nfts, recipientAddress);
    const filePath = outputFilePath || path.join(process.cwd(), 'src/data/nfts-data-exported.json');
    
    fs.writeFileSync(filePath, JSON.stringify(originalFormat, null, 2));
    console.log(`NFTs data exported in original format to ${filePath}`);
    
    return true;
  } catch (error) {
    console.error('Error exporting NFTs to original format:', error);
    return false;
  }
};

export default {
  getNFTsWithMetadataForWallet,
  getNFTsFromFile,
  getNFTsForListings,
  getOriginalNFTsFormat,
  exportNFTsToOriginalFormat
}; 