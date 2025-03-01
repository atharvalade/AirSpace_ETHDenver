import NonFungibleToken from 0xNonFungibleToken
import MetadataViews from 0xMetadataViews

pub contract AirSpaceNFT: NonFungibleToken {

    pub var totalSupply: UInt64

    pub event ContractInitialized()
    pub event Withdraw(id: UInt64, from: Address?)
    pub event Deposit(id: UInt64, to: Address?)
    pub event Minted(id: UInt64, propertyAddress: String, currentHeight: UInt64, maximumHeight: UInt64, availableFloors: UInt64, price: UFix64)

    pub let CollectionStoragePath: StoragePath
    pub let CollectionPublicPath: PublicPath
    pub let MinterStoragePath: StoragePath

    pub resource NFT: NonFungibleToken.INFT, MetadataViews.Resolver {
        pub let id: UInt64
        pub let propertyAddress: String
        pub let currentHeight: UInt64
        pub let maximumHeight: UInt64
        pub let availableFloors: UInt64
        pub let price: UFix64
        pub let mintedAt: UFix64
        pub let metadata: {String: AnyStruct}
        pub let ipfsHash: String

        init(
            id: UInt64,
            propertyAddress: String,
            currentHeight: UInt64,
            maximumHeight: UInt64,
            availableFloors: UInt64,
            price: UFix64,
            metadata: {String: AnyStruct},
            ipfsHash: String
        ) {
            self.id = id
            self.propertyAddress = propertyAddress
            self.currentHeight = currentHeight
            self.maximumHeight = maximumHeight
            self.availableFloors = availableFloors
            self.price = price
            self.mintedAt = getCurrentBlock().timestamp
            self.metadata = metadata
            self.ipfsHash = ipfsHash
        }

        pub fun getViews(): [Type] {
            return [
                Type<MetadataViews.Display>(),
                Type<MetadataViews.Royalties>(),
                Type<MetadataViews.NFTCollectionData>(),
                Type<MetadataViews.NFTCollectionDisplay>(),
                Type<MetadataViews.ExternalURL>(),
                Type<MetadataViews.IPFSFile>()
            ]
        }

        pub fun resolveView(_ view: Type): AnyStruct? {
            switch view {
                case Type<MetadataViews.Display>():
                    let title = self.metadata["title"] as? String ?? "AirSpace NFT"
                    let name = self.metadata["name"] as? String ?? "AirSpace NFT #".concat(self.id.toString())
                    let description = self.metadata["description"] as? String ?? "Air rights for property at ".concat(self.propertyAddress)
                    
                    return MetadataViews.Display(
                        name: name,
                        description: description,
                        thumbnail: MetadataViews.HTTPFile(
                            url: "https://ipfs.io/ipfs/".concat(self.ipfsHash)
                        )
                    )
                
                case Type<MetadataViews.IPFSFile>():
                    return MetadataViews.IPFSFile(
                        cid: self.ipfsHash,
                        path: nil
                    )
                
                case Type<MetadataViews.ExternalURL>():
                    return MetadataViews.ExternalURL("https://ipfs.io/ipfs/".concat(self.ipfsHash))
                
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
        // Mint a new NFT with basic properties
        pub fun mintNFT(
            recipient: &{NonFungibleToken.CollectionPublic},
            propertyAddress: String,
            currentHeight: UInt64,
            maximumHeight: UInt64,
            availableFloors: UInt64,
            price: UFix64
        ) {
            // Create a new NFT
            var newNFT <- create NFT(
                id: AirSpaceNFT.totalSupply,
                propertyAddress: propertyAddress,
                currentHeight: currentHeight,
                maximumHeight: maximumHeight,
                availableFloors: availableFloors,
                price: price,
                metadata: {},
                ipfsHash: ""
            )

            // Deposit it in the recipient's account
            recipient.deposit(token: <-newNFT)

            emit Minted(
                id: AirSpaceNFT.totalSupply,
                propertyAddress: propertyAddress,
                currentHeight: currentHeight,
                maximumHeight: maximumHeight,
                availableFloors: availableFloors,
                price: price
            )

            AirSpaceNFT.totalSupply = AirSpaceNFT.totalSupply + 1
        }
        
        // Mint a new NFT with metadata and IPFS hash
        pub fun mintNFTWithMetadata(
            recipient: &{NonFungibleToken.CollectionPublic},
            tokenId: UInt64,
            propertyAddress: String,
            currentHeight: UInt64,
            maximumHeight: UInt64,
            availableFloors: UInt64,
            price: UFix64,
            metadata: {String: AnyStruct}
        ) {
            // Get IPFS hash from metadata
            let ipfsHash = metadata["ipfsHash"] as? String ?? ""
            
            // Create a new NFT
            var newNFT <- create NFT(
                id: tokenId,
                propertyAddress: propertyAddress,
                currentHeight: currentHeight,
                maximumHeight: maximumHeight,
                availableFloors: availableFloors,
                price: price,
                metadata: metadata,
                ipfsHash: ipfsHash
            )

            // Deposit it in the recipient's account
            recipient.deposit(token: <-newNFT)

            emit Minted(
                id: tokenId,
                propertyAddress: propertyAddress,
                currentHeight: currentHeight,
                maximumHeight: maximumHeight,
                availableFloors: availableFloors,
                price: price
            )

            // Update total supply if needed
            if tokenId >= AirSpaceNFT.totalSupply {
                AirSpaceNFT.totalSupply = tokenId + 1
            }
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