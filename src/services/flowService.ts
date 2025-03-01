import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";

// Configure FCL for Flow testnet
fcl.config({
  "accessNode.api": "https://rest-testnet.onflow.org", // Testnet API
  "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn", // Testnet Wallet Discovery
  "app.detail.title": "AirSpace NFT Marketplace",
  "app.detail.icon": "https://airspace.com/icon.png", // Replace with your app icon
  "0xFlowToken": "0x7e60df042a9c0868", // Flow Token on testnet
})

// Sample NFT contract code
export const NFT_CONTRACT_CODE = `
import NonFungibleToken from 0x631e88ae7f1d7c20
import MetadataViews from 0x631e88ae7f1d7c20

pub contract AirSpaceNFT: NonFungibleToken {

    pub var totalSupply: UInt64

    pub event ContractInitialized()
    pub event Withdraw(id: UInt64, from: Address?)
    pub event Deposit(id: UInt64, to: Address?)
    pub event Minted(id: UInt64, propertyAddress: String, currentHeight: String, maximumHeight: String)

    pub let CollectionStoragePath: StoragePath
    pub let CollectionPublicPath: PublicPath
    pub let MinterStoragePath: StoragePath

    pub resource NFT: NonFungibleToken.INFT, MetadataViews.Resolver {
        pub let id: UInt64
        pub let propertyAddress: String
        pub let currentHeight: String
        pub let maximumHeight: String
        pub let availableFloors: String
        pub let price: String
        pub let mintedAt: UFix64

        init(
            id: UInt64,
            propertyAddress: String,
            currentHeight: String,
            maximumHeight: String,
            availableFloors: String,
            price: String
        ) {
            self.id = id
            self.propertyAddress = propertyAddress
            self.currentHeight = currentHeight
            self.maximumHeight = maximumHeight
            self.availableFloors = availableFloors
            self.price = price
            self.mintedAt = getCurrentBlock().timestamp
        }

        pub fun getViews(): [Type] {
            return [
                Type<MetadataViews.Display>(),
                Type<MetadataViews.Royalties>(),
                Type<MetadataViews.NFTCollectionData>(),
                Type<MetadataViews.NFTCollectionDisplay>()
            ]
        }

        pub fun resolveView(_ view: Type): AnyStruct? {
            switch view {
                case Type<MetadataViews.Display>():
                    return MetadataViews.Display(
                        name: "AirSpace NFT #".concat(self.id.toString()),
                        description: "Air rights for property at ".concat(self.propertyAddress),
                        thumbnail: MetadataViews.HTTPFile(
                            url: "https://airspace.com/nft/".concat(self.id.toString())
                        )
                    )
                case Type<MetadataViews.Royalties>():
                    return MetadataViews.Royalties([
                        MetadataViews.Royalty(
                            receiver: getAccount(0x1234567890abcdef).getCapability<&{FungibleToken.Receiver}>(/public/flowTokenReceiver),
                            cut: 0.05, // 5% royalty
                            description: "AirSpace platform fee"
                        )
                    ])
                case Type<MetadataViews.NFTCollectionData>():
                    return MetadataViews.NFTCollectionData(
                        storagePath: AirSpaceNFT.CollectionStoragePath,
                        publicPath: AirSpaceNFT.CollectionPublicPath,
                        providerPath: /private/airSpaceNFTCollection,
                        publicCollection: Type<&AirSpaceNFT.Collection{AirSpaceNFT.AirSpaceNFTCollectionPublic}>(),
                        publicLinkedType: Type<&AirSpaceNFT.Collection{AirSpaceNFT.AirSpaceNFTCollectionPublic,NonFungibleToken.CollectionPublic,NonFungibleToken.Receiver,MetadataViews.ResolverCollection}>(),
                        providerLinkedType: Type<&AirSpaceNFT.Collection{AirSpaceNFT.AirSpaceNFTCollectionPublic,NonFungibleToken.CollectionPublic,NonFungibleToken.Provider,MetadataViews.ResolverCollection}>(),
                        createEmptyCollectionFunction: (fun(): @NonFungibleToken.Collection {
                            return <-AirSpaceNFT.createEmptyCollection()
                        })
                    )
                case Type<MetadataViews.NFTCollectionDisplay>():
                    return MetadataViews.NFTCollectionDisplay(
                        name: "AirSpace NFT Collection",
                        description: "Collection of air rights for properties",
                        externalURL: MetadataViews.ExternalURL("https://airspace.com"),
                        squareImage: MetadataViews.Media(
                            file: MetadataViews.HTTPFile(
                                url: "https://airspace.com/logo.png"
                            ),
                            mediaType: "image/png"
                        ),
                        bannerImage: MetadataViews.Media(
                            file: MetadataViews.HTTPFile(
                                url: "https://airspace.com/banner.png"
                            ),
                            mediaType: "image/png"
                        ),
                        socials: {
                            "twitter": MetadataViews.ExternalURL("https://twitter.com/airspace")
                        }
                    )
            }
            return nil
        }
    }

    pub resource interface AirSpaceNFTCollectionPublic {
        pub fun deposit(token: @NonFungibleToken.NFT)
        pub fun getIDs(): [UInt64]
        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT
        pub fun borrowAirSpaceNFT(id: UInt64): &AirSpaceNFT.NFT? {
            post {
                (result == nil) || (result?.id == id):
                    "Cannot borrow AirSpaceNFT reference: the ID of the returned reference is incorrect"
            }
        }
    }

    pub resource Collection: AirSpaceNFTCollectionPublic, NonFungibleToken.Provider, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection {
        pub var ownedNFTs: @{UInt64: NonFungibleToken.NFT}

        init () {
            self.ownedNFTs <- {}
        }

        pub fun withdraw(withdrawID: UInt64): @NonFungibleToken.NFT {
            let token <- self.ownedNFTs.remove(key: withdrawID) ?? panic("missing NFT")
            emit Withdraw(id: token.id, from: self.owner?.address)
            return <-token
        }

        pub fun deposit(token: @NonFungibleToken.NFT) {
            let token <- token as! @AirSpaceNFT.NFT
            let id: UInt64 = token.id
            let oldToken <- self.ownedNFTs[id] <- token
            emit Deposit(id: id, to: self.owner?.address)
            destroy oldToken
        }

        pub fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }

        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT {
            return (&self.ownedNFTs[id] as &NonFungibleToken.NFT?)!
        }

        pub fun borrowAirSpaceNFT(id: UInt64): &AirSpaceNFT.NFT? {
            if self.ownedNFTs[id] != nil {
                let ref = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
                return ref as! &AirSpaceNFT.NFT
            }
            return nil
        }

        pub fun borrowViewResolver(id: UInt64): &AnyResource{MetadataViews.Resolver} {
            let nft = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
            let airSpaceNFT = nft as! &AirSpaceNFT.NFT
            return airSpaceNFT
        }

        destroy() {
            destroy self.ownedNFTs
        }
    }

    pub fun createEmptyCollection(): @NonFungibleToken.Collection {
        return <- create Collection()
    }

    pub resource NFTMinter {
        pub fun mintNFT(
            recipient: &{NonFungibleToken.CollectionPublic},
            propertyAddress: String,
            currentHeight: String,
            maximumHeight: String,
            availableFloors: String,
            price: String
        ) {
            let metadata: {String: AnyStruct} = {}
            
            // Create a new NFT
            var newNFT <- create NFT(
                id: AirSpaceNFT.totalSupply,
                propertyAddress: propertyAddress,
                currentHeight: currentHeight,
                maximumHeight: maximumHeight,
                availableFloors: availableFloors,
                price: price
            )

            // Deposit it in the recipient's account
            recipient.deposit(token: <-newNFT)

            emit Minted(
                id: AirSpaceNFT.totalSupply,
                propertyAddress: propertyAddress,
                currentHeight: currentHeight,
                maximumHeight: maximumHeight
            )

            AirSpaceNFT.totalSupply = AirSpaceNFT.totalSupply + 1
        }
    }

    init() {
        self.totalSupply = 0

        self.CollectionStoragePath = /storage/airSpaceNFTCollection
        self.CollectionPublicPath = /public/airSpaceNFTCollection
        self.MinterStoragePath = /storage/airSpaceNFTMinter

        // Create a Collection for the deployer
        let collection <- create Collection()
        self.account.save(<-collection, to: self.CollectionStoragePath)

        // Create a public capability for the collection
        self.account.link<&AirSpaceNFT.Collection{NonFungibleToken.CollectionPublic, AirSpaceNFT.AirSpaceNFTCollectionPublic, MetadataViews.ResolverCollection}>(
            self.CollectionPublicPath,
            target: self.CollectionStoragePath
        )

        // Create a Minter resource and save it to storage
        let minter <- create NFTMinter()
        self.account.save(<-minter, to: self.MinterStoragePath)

        emit ContractInitialized()
    }
}
`;

// Transaction to mint an NFT
export const MINT_NFT_TRANSACTION = `
import AirSpaceNFT from 0xDEPLOYER_ADDRESS

transaction(
  recipientAddress: Address,
  propertyAddress: String,
  currentHeight: String,
  maximumHeight: String,
  availableFloors: String,
  price: String
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
    self.minterRef.mintNFT(
      recipient: self.recipientCollectionRef,
      propertyAddress: propertyAddress,
      currentHeight: currentHeight,
      maximumHeight: maximumHeight,
      availableFloors: availableFloors,
      price: price
    )
  }
}
`;

// Transaction to setup an account to receive NFTs
export const SETUP_ACCOUNT_TRANSACTION = `
import NonFungibleToken from 0x631e88ae7f1d7c20
import MetadataViews from 0x631e88ae7f1d7c20
import AirSpaceNFT from 0xDEPLOYER_ADDRESS

transaction {
  prepare(signer: AuthAccount) {
    // Check if the account already has a collection
    if signer.borrow<&AirSpaceNFT.Collection>(from: AirSpaceNFT.CollectionStoragePath) == nil {
      // Create a new empty collection
      let collection <- AirSpaceNFT.createEmptyCollection()
      
      // Save it to the account
      signer.save(<-collection, to: AirSpaceNFT.CollectionStoragePath)

      // Create a public capability for the collection
      signer.link<&AirSpaceNFT.Collection{NonFungibleToken.CollectionPublic, AirSpaceNFT.AirSpaceNFTCollectionPublic, MetadataViews.ResolverCollection}>(
        AirSpaceNFT.CollectionPublicPath,
        target: AirSpaceNFT.CollectionStoragePath
      )
    }
  }
}
`;

// Hardcoded contract address for testing
export const CONTRACT_ADDRESS = "0x1234567890abcdef";
export const RECIPIENT_ADDRESS = "0xabcdef1234567890"; // Hardcoded recipient address

// Function to authenticate with Flow
export const authenticate = async () => {
  return await fcl.authenticate();
};

// Function to check if user is logged in
export const isLoggedIn = async () => {
  const user = await fcl.currentUser().snapshot();
  return user && user.loggedIn;
};

// Function to get current user
export const getCurrentUser = async () => {
  return await fcl.currentUser().snapshot();
};

// Function to mint an NFT
export const mintNFT = async (nftData: {
  propertyAddress: string;
  currentHeight: string;
  maximumHeight: string;
  availableFloors: string;
  price: string;
}) => {
  try {
    const transactionId = await fcl.mutate({
      cadence: MINT_NFT_TRANSACTION.replace("0xDEPLOYER_ADDRESS", CONTRACT_ADDRESS),
      args: (arg: any, t: any) => [
        arg(RECIPIENT_ADDRESS, t.Address),
        arg(nftData.propertyAddress, t.String),
        arg(nftData.currentHeight, t.String),
        arg(nftData.maximumHeight, t.String),
        arg(nftData.availableFloors, t.String),
        arg(nftData.price, t.String)
      ],
      payer: fcl.authz,
      proposer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 999
    });

    console.log("Transaction ID:", transactionId);
    
    // Wait for transaction to be sealed
    const transaction = await fcl.tx(transactionId).onceSealed();
    console.log("Transaction sealed:", transaction);
    
    return {
      transactionId,
      status: transaction.status,
      events: transaction.events
    };
  } catch (error) {
    console.error("Error minting NFT:", error);
    throw error;
  }
};

// Function to setup an account to receive NFTs
export const setupAccount = async () => {
  try {
    const transactionId = await fcl.mutate({
      cadence: SETUP_ACCOUNT_TRANSACTION.replace("0xDEPLOYER_ADDRESS", CONTRACT_ADDRESS),
      args: (arg: any, t: any) => [],
      payer: fcl.authz,
      proposer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 999
    });

    console.log("Setup Transaction ID:", transactionId);
    
    // Wait for transaction to be sealed
    const transaction = await fcl.tx(transactionId).onceSealed();
    console.log("Setup Transaction sealed:", transaction);
    
    return {
      transactionId,
      status: transaction.status
    };
  } catch (error) {
    console.error("Error setting up account:", error);
    throw error;
  }
};

// Function to get NFTs owned by an address
export const getNFTsByAddress = async (address: string) => {
  try {
    const result = await fcl.query({
      cadence: `
        import AirSpaceNFT from ${CONTRACT_ADDRESS}
        import MetadataViews from 0x631e88ae7f1d7c20

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
            
            let display = nft.resolveView(Type<MetadataViews.Display>())! as! MetadataViews.Display
            
            let nftData = {
              "id": id,
              "name": display.name,
              "description": display.description,
              "thumbnail": display.thumbnail.uri()
            }
            
            nfts.append(nftData)
          }
          
          return nfts
        }
      `,
      args: (arg: any, t: any) => [arg(address, t.Address)]
    });

    return result;
  } catch (error) {
    console.error("Error getting NFTs:", error);
    throw error;
  }
};

// Export the service
const flowService = {
  authenticate,
  isLoggedIn,
  getCurrentUser,
  mintNFT,
  setupAccount,
  getNFTsByAddress,
  CONTRACT_ADDRESS,
  RECIPIENT_ADDRESS
};

export default flowService; 