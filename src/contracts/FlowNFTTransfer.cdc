import NonFungibleToken from 0xNonFungibleToken
import MetadataViews from 0xMetadataViews
import AirSpaceNFT from 0xAirSpaceNFT

/// This transaction transfers an AirSpace NFT from a specific wallet to the recipient
/// The transaction is signed by the owner of the NFT (the source wallet)
transaction(
  sourceAddress: Address,
  recipientAddress: Address,
  nftID: UInt64
) {
  // Reference to the source collection
  let sourceCollection: &AirSpaceNFT.Collection{NonFungibleToken.Provider}
  
  // Reference to the recipient collection
  let recipientCollection: &{NonFungibleToken.CollectionPublic}
  
  prepare(signer: AuthAccount) {
    // Get the source collection reference
    // This requires the signer to be the owner of the source wallet
    self.sourceCollection = signer.borrow<&AirSpaceNFT.Collection{NonFungibleToken.Provider}>(
      from: AirSpaceNFT.CollectionStoragePath
    ) ?? panic("Could not borrow a reference to the source collection")
    
    // Get the recipient's collection reference
    self.recipientCollection = getAccount(recipientAddress)
      .getCapability(AirSpaceNFT.CollectionPublicPath)
      .borrow<&{NonFungibleToken.CollectionPublic}>()
      ?? panic("Could not borrow a reference to the recipient's collection")
  }
  
  execute {
    // Withdraw the NFT from the source collection
    let nft <- self.sourceCollection.withdraw(withdrawID: nftID)
    
    // Deposit the NFT to the recipient collection
    self.recipientCollection.deposit(token: <-nft)
    
    log("NFT transferred from ".concat(sourceAddress.toString()).concat(" to ").concat(recipientAddress.toString()))
  }
} 