import NonFungibleToken from 0xNonFungibleToken
import MetadataViews from 0xMetadataViews

pub contract AirSpaceNFT: NonFungibleToken {

    // Events
    pub event ContractInitialized()
    pub event Withdraw(id: UInt64, from: Address?)
    pub event Deposit(id: UInt64, to: Address?)
    pub event Minted(id: UInt64, propertyAddress: String, currentHeight: UInt64, maximumHeight: UInt64, availableFloors: UInt64, price: UFix64)

    // Named Paths
    pub let CollectionStoragePath: StoragePath
    pub let CollectionPublicPath: PublicPath
    pub let MinterStoragePath: StoragePath

    // Total supply of AirSpaceNFTs
    pub var totalSupply: UInt64

    // AirSpaceNFT NFT
    pub resource NFT: NonFungibleToken.INFT, MetadataViews.Resolver {
        pub let id: UInt64
        pub let propertyAddress: String
        pub let currentHeight: UInt64
        pub let maximumHeight: UInt64
        pub let availableFloors: UInt64
        pub let price: UFix64
        pub let mintedAt: UFix64

        init(
            id: UInt64,
            propertyAddress: String,
            currentHeight: UInt64,
            maximumHeight: UInt64,
            availableFloors: UInt64,
            price: UFix64
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
                Type<MetadataViews.ExternalURL>(),
                Type<MetadataViews.NFTCollectionData>(),
                Type<MetadataViews.NFTCollectionDisplay>(),
                Type<MetadataViews.Serial>()
            ]
        }

        pub fun resolveView(_ view: Type): AnyStruct? {
            switch view {
                case Type<MetadataViews.Display>():
                    return MetadataViews.Display(
                        name: "AirSpace NFT #".concat(self.id.toString()),
                        description: "Air rights for property at ".concat(self.propertyAddress),
                        thumbnail: MetadataViews.HTTPFile(
                            url: "https://airspace.com/nft/".concat(self.id.toString()).concat(".png")
                        )
                    )
                case Type<MetadataViews.Royalties>():
                    return MetadataViews.Royalties([
                        MetadataViews.Royalty(
                            receiver: getAccount(0xAirSpaceNFT).getCapability<&{FungibleToken.Receiver}>(/public/flowTokenReceiver),
                            cut: 0.05, // 5% royalty
                            description: "AirSpace platform fee"
                        )
                    ])
                case Type<MetadataViews.ExternalURL>():
                    return MetadataViews.ExternalURL("https://airspace.com/nft/".concat(self.id.toString()))
                case Type<MetadataViews.NFTCollectionData>():
                    return MetadataViews.NFTCollectionData(
                        storagePath: AirSpaceNFT.CollectionStoragePath,
                        publicPath: AirSpaceNFT.CollectionPublicPath,
                        providerPath: /private/AirSpaceNFTCollection,
                        publicCollection: Type<&AirSpaceNFT.Collection{AirSpaceNFT.AirSpaceNFTCollectionPublic}>(),
                        publicLinkedType: Type<&AirSpaceNFT.Collection{AirSpaceNFT.AirSpaceNFTCollectionPublic,NonFungibleToken.CollectionPublic,NonFungibleToken.Receiver,MetadataViews.ResolverCollection}>(),
                        providerLinkedType: Type<&AirSpaceNFT.Collection{AirSpaceNFT.AirSpaceNFTCollectionPublic,NonFungibleToken.CollectionPublic,NonFungibleToken.Provider,MetadataViews.ResolverCollection}>(),
                        createEmptyCollectionFunction: (fun (): @NonFungibleToken.Collection {
                            return <-AirSpaceNFT.createEmptyCollection()
                        })
                    )
                case Type<MetadataViews.NFTCollectionDisplay>():
                    let media = MetadataViews.Media(
                        file: MetadataViews.HTTPFile(
                            url: "https://airspace.com/logo.png"
                        ),
                        mediaType: "image/png"
                    )
                    return MetadataViews.NFTCollectionDisplay(
                        name: "AirSpace NFT Collection",
                        description: "NFTs representing air rights for properties",
                        externalURL: MetadataViews.ExternalURL("https://airspace.com"),
                        squareImage: media,
                        bannerImage: media,
                        socials: {
                            "twitter": MetadataViews.ExternalURL("https://twitter.com/airspace")
                        }
                    )
                case Type<MetadataViews.Serial>():
                    return MetadataViews.Serial(
                        self.id
                    )
            }
            return nil
        }
    }

    // Collection interface that allows reading NFT metadata
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

    // Collection resource that holds NFTs
    pub resource Collection: AirSpaceNFTCollectionPublic, NonFungibleToken.Provider, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection {
        // Dictionary of NFT conforming tokens
        // NFT is a resource type with an `UInt64` ID field
        pub var ownedNFTs: @{UInt64: NonFungibleToken.NFT}

        init () {
            self.ownedNFTs <- {}
        }

        // Withdraw removes an NFT from the collection and moves it to the caller
        pub fun withdraw(withdrawID: UInt64): @NonFungibleToken.NFT {
            let token <- self.ownedNFTs.remove(key: withdrawID) ?? panic("missing NFT")

            emit Withdraw(id: token.id, from: self.owner?.address)

            return <-token
        }

        // Deposit takes a NFT and adds it to the collections dictionary
        // and adds the ID to the id array
        pub fun deposit(token: @NonFungibleToken.NFT) {
            let token <- token as! @AirSpaceNFT.NFT

            let id: UInt64 = token.id

            // Add the new token to the dictionary which removes the old one
            let oldToken <- self.ownedNFTs[id] <- token

            emit Deposit(id: id, to: self.owner?.address)

            destroy oldToken
        }

        // getIDs returns an array of the IDs that are in the collection
        pub fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }

        // borrowNFT gets a reference to an NFT in the collection
        // so that the caller can read its metadata and call its methods
        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT {
            return (&self.ownedNFTs[id] as &NonFungibleToken.NFT?)!
        }

        // borrowAirSpaceNFT returns a borrowed reference to an AirSpace NFT
        pub fun borrowAirSpaceNFT(id: UInt64): &AirSpaceNFT.NFT? {
            if self.ownedNFTs[id] != nil {
                let ref = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
                return ref as! &AirSpaceNFT.NFT
            }
            return nil
        }

        // borrowViewResolver returns a borrowed reference to a MetadataViews resolver
        pub fun borrowViewResolver(id: UInt64): &AnyResource{MetadataViews.Resolver} {
            let nft = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
            let airSpaceNFT = nft as! &AirSpaceNFT.NFT
            return airSpaceNFT as &AnyResource{MetadataViews.Resolver}
        }

        destroy() {
            destroy self.ownedNFTs
        }
    }

    // Public function that anyone can call to create a new empty collection
    pub fun createEmptyCollection(): @NonFungibleToken.Collection {
        return <- create Collection()
    }

    // Resource that an admin or minter would own to mint new NFTs
    pub resource NFTMinter {
        // Mint a new NFT
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
                price: price
            )

            // Deposit it in the recipient's account using their reference
            recipient.deposit(token: <-newNFT)

            // Emit the Minted event
            emit Minted(
                id: AirSpaceNFT.totalSupply,
                propertyAddress: propertyAddress,
                currentHeight: currentHeight,
                maximumHeight: maximumHeight,
                availableFloors: availableFloors,
                price: price
            )

            // Increment the totalSupply
            AirSpaceNFT.totalSupply = AirSpaceNFT.totalSupply + 1
        }
    }

    // Initialize the contract
    init() {
        // Set the named paths
        self.CollectionStoragePath = /storage/AirSpaceNFTCollection
        self.CollectionPublicPath = /public/AirSpaceNFTCollection
        self.MinterStoragePath = /storage/AirSpaceNFTMinter

        // Initialize the total supply
        self.totalSupply = 0

        // Create a Minter resource and save it to storage
        let minter <- create NFTMinter()
        self.account.save(<-minter, to: self.MinterStoragePath)

        emit ContractInitialized()
    }
} 