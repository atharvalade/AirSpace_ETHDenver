import { useEffect, useState } from 'react';
import { getNFTsForListings } from '@/scripts/getNFTsForListings';
import { NFT } from '@/types/nft';
import { useFlow } from '@/context/FlowContext';

export default function ListingsPage() {
  const [listings, setListings] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useFlow();

  useEffect(() => {
    async function fetchListings() {
      try {
        setLoading(true);
        
        // Try to get NFTs from the wallet address first, then from the file
        const walletAddress = "0xa20C96EA7B9AbAe32217EbA25577cDe099039D5D"; // Replace with the actual wallet address
        const filePath = "nfts-data.json"; // Path to the NFT data file
        
        const nfts = await getNFTsForListings(walletAddress, filePath);
        
        if (nfts.length === 0) {
          setError("No NFT listings found. Please mint some NFTs first.");
        } else {
          setListings(nfts);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching listings:", err);
        setError("Failed to fetch listings. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    
    fetchListings();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">AirSpace NFT Listings</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((nft) => (
            <div key={nft.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative h-48">
                <img 
                  src={nft.image_url || nft.thumbnail || '/images/placeholder.jpg'} 
                  alt={nft.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{nft.title}</h2>
                <p className="text-gray-600 mb-4 line-clamp-2">{nft.description}</p>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Property Address</p>
                  <p className="font-medium">{nft.propertyAddress}</p>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Current Height</p>
                    <p className="font-medium">{nft.currentHeight} m</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Maximum Height</p>
                    <p className="font-medium">{nft.maximumHeight} m</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Available Floors</p>
                    <p className="font-medium">{nft.availableFloors}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="text-xl font-bold">${nft.price.toLocaleString()}</p>
                  </div>
                  
                  <button 
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                    onClick={() => window.location.href = `/listings/${nft.id}`}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 