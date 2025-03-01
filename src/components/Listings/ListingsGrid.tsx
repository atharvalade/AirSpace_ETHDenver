"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { NFT } from "@/types/nft";
import { AgreementDialog } from "./AgreementDialog";
import dynamic from 'next/dynamic';
import 'mapbox-gl/dist/mapbox-gl.css';
import HumanityVerificationDialog from "./HumanityVerificationDialog";
import ZkVerificationBadge from "@/components/ZkVerificationBadge";

// Dynamically import the map component with no SSR
const PropertyMapView = dynamic(() => import('./PropertyMapView'), {
  ssr: false,
  loading: () => (
    <div className="relative h-[400px] rounded-2xl bg-darkmode/50 flex items-center justify-center">
      <div className="text-white">Loading 3D Map...</div>
    </div>
  )
});

// Add these constants at the top of the file
const SELLER_DETAILS = {
  address: "0x676AB843E8aDd6363779409Ee5057f4a26F46F59",
  physical_address: "123 Blockchain Street, Crypto City, CC 12345",
  name: "AirSpace Holdings LLC"
};

const BUYER_DETAILS = {
  address: "0x123ABC456DEF789GHI987JKL654MNO321PQR",
  physical_address: "456 Token Avenue, Digital Town, DT 67890",
  name: "Eddie Murphy"
};

// Define interface for the API response
interface ApiNFT {
  tokenId: number;
  ipfsHash: string;
  metadata: {
    title: string;
    name: string;
    description: string;
    attributes: {
      trait_type: string;
      value: string | number;
    }[];
    properties: {
      coordinates: {
        latitude: number;
        longitude: number;
      }
    }
  }
}

interface ApiResponse {
  data: ApiNFT[];
  wallet: string;
}

export const ListingsGrid = () => {
  const [listings, setListings] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAgreementOpen, setIsAgreementOpen] = useState(false);
  const [agreementText, setAgreementText] = useState<string | null>(null);
  const [agreementLoading, setAgreementLoading] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [isHumanityVerificationOpen, setIsHumanityVerificationOpen] = useState(false);
  const [verifiedListings, setVerifiedListings] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch('https://apinft-zeta.vercel.app/api/nfts');
        if (!response.ok) {
          throw new Error('Failed to fetch listings');
        }
        const apiResponse: ApiResponse = await response.json();
        
        // Transform API data to match our NFT interface
        const transformedListings: NFT[] = apiResponse.data.map(item => {
          // Find attributes by trait_type
          const getAttributeValue = (traitType: string) => {
            const attr = item.metadata.attributes.find(a => a.trait_type === traitType);
            return attr ? String(attr.value) : '';
          };
          
          // Parse numeric values
          const currentHeight = parseInt(getAttributeValue('Current Height')) || 0;
          const maximumHeight = parseInt(getAttributeValue('Maximum Height')) || 0;
          const priceValue = parseFloat(getAttributeValue('Price').replace(/,/g, '')) || 0;
          
          return {
            id: item.tokenId.toString(),
            token_id: item.tokenId,
            title: item.metadata.title,
            name: item.metadata.name,
            description: item.metadata.description,
            propertyAddress: getAttributeValue('Property Address'),
            currentHeight: currentHeight,
            maximumHeight: maximumHeight,
            availableFloors: maximumHeight - currentHeight,
            price: priceValue,
            thumbnail: getListingImage(item.metadata.title),
            contract_address: "0x1234567890abcdef1234567890abcdef12345678", // Placeholder
            image_url: getListingImage(item.metadata.title),
            latitude: item.metadata.properties.coordinates.latitude,
            longitude: item.metadata.properties.coordinates.longitude
          };
        });
        
        setListings(transformedListings);
        
        // Set all listings as verified (mock data)
        const verifiedMap: Record<string, boolean> = {};
        transformedListings.forEach(listing => {
          verifiedMap[listing.id] = true;
        });
        setVerifiedListings(verifiedMap);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch listings');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleBuyClick = async (nft: NFT) => {
    setSelectedNFT(nft);
    // Open humanity verification dialog first
    setIsHumanityVerificationOpen(true);
  };

  const handleHumanityVerified = () => {
    // After humanity verification is successful, show the agreement dialog
    setAgreementLoading(true);
    setIsAgreementOpen(true);

    try {
      // Generate placeholder agreement instead of fetching from API
      if (selectedNFT) {
        const placeholderAgreement = `
**Agreement Between ${SELLER_DETAILS.name} and ${BUYER_DETAILS.name}: NFT Purchase Agreement for ${selectedNFT.title}**

This Agreement is made effective as of ${new Date().toLocaleDateString()}.

**1. Purchase Price and Payment Terms**
Buyer agrees to pay $${selectedNFT.price.toLocaleString()} USDC for the NFT Token ID: ${selectedNFT.token_id}.

**2. Property Details**
- Property Address: ${selectedNFT.propertyAddress}
- Current Height: ${selectedNFT.currentHeight} floors
- Maximum Height: ${selectedNFT.maximumHeight} floors
- Available Floors: ${selectedNFT.availableFloors} floors

**3. Parties**
Seller:
- Name: ${SELLER_DETAILS.name}
- Address: ${SELLER_DETAILS.physical_address}
- Wallet: ${SELLER_DETAILS.address}

Buyer:
- Name: ${BUYER_DETAILS.name}
- Address: ${BUYER_DETAILS.physical_address}
- Wallet: ${BUYER_DETAILS.address}

**4. Ownership Transfer**
Upon receipt of complete payment, all rights and ownership will be transferred to the buyer.

**5. Terms and Conditions**
The buyer acknowledges that this NFT represents the right to build additional floors on the property, subject to local regulations and zoning laws.
`;
        
        setAgreementText(placeholderAgreement);
      } else {
        setAgreementText('No property selected. Please try again.');
      }
    } catch (err) {
      console.error('Error generating agreement:', err);
      setAgreementText('Failed to generate agreement. Please try again.');
    } finally {
      setAgreementLoading(false);
    }
  };

  const getListingImage = (title: string) => {
    const firstWord = title.split(' ')[0].toLowerCase();
    switch (firstWord) {
      case 'niagara':
        return "/images/hero/banner-image.png";
      case 'vancouver':
        return "/images/listings/vancouver.png";
      case 'miami':
        return "/images/listings/miami.png";
      case 'sydney':
        return "/images/listings/sydney.png";
      case 'dubai':
        return "/images/listings/dubai.png";
      default:
        return "/images/hero/banner-image.png";
    }
  };

  if (loading) return <div className="text-white text-center py-20">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-20">{error}</div>;

  return (
    <>
      <div className="grid gap-8">
        {listings.map((listing) => (
          <div key={listing.id} className="grid lg:grid-cols-2 gap-8 bg-dark_grey bg-opacity-35 rounded-3xl p-8">
            <div className="relative h-[400px] rounded-2xl overflow-hidden">
              {/* Replace static image with 3D map */}
              <PropertyMapView nft={listing} />
            </div>
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white text-28">{listing.title}</h2>
                  <ZkVerificationBadge 
                    verified={verifiedListings[listing.id] || false} 
                    proofId={`proof-${listing.id}`}
                    system="groth16"
                  />
                </div>
                <p className="text-muted text-opacity-80 text-16 mb-4">
                  {listing.propertyAddress}
                </p>
                <p className="text-muted text-opacity-60 text-18 mb-6">
                  {listing.description}
                </p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-deepSlate p-4 rounded-xl">
                    <p className="text-muted text-16">Current Height</p>
                    <p className="text-white text-24">{listing.currentHeight} floors</p>
                  </div>
                  <div className="bg-deepSlate p-4 rounded-xl">
                    <p className="text-muted text-16">Max Allowed Height</p>
                    <p className="text-white text-24">{listing.maximumHeight} floors</p>
                  </div>
                </div>
                <div className="bg-deepSlate p-4 rounded-xl mb-8">
                  <p className="text-muted text-16">Floors to be Bought</p>
                  <p className="text-primary text-24">{listing.availableFloors} floors</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted text-16">Price</p>
                  <p className="text-primary text-32">${listing.price.toLocaleString()} USDC</p>
                </div>
                <button 
                  className="bg-primary text-darkmode px-8 py-3 rounded-lg text-18 font-medium hover:bg-opacity-90 transition-all"
                  onClick={() => handleBuyClick(listing)}
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <HumanityVerificationDialog
        isOpen={isHumanityVerificationOpen}
        onClose={() => setIsHumanityVerificationOpen(false)}
        onVerified={handleHumanityVerified}
      />

      <AgreementDialog
        isOpen={isAgreementOpen}
        onClose={() => setIsAgreementOpen(false)}
        agreement={agreementText}
        loading={agreementLoading}
        nft={selectedNFT}
      />
    </>
  );
}; 