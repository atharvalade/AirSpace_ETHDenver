"use client";

import { useState, useEffect } from 'react';
import { useFlow } from '@/context/FlowContext';
import flowNftService from '@/services/flowNftService';
import { toast } from 'react-hot-toast';
import { Icon } from '@iconify/react';

interface FlowNFT {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
}

export const FlowNFTGallery = () => {
  const { user } = useFlow();
  const [nfts, setNfts] = useState<FlowNFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!user.loggedIn) {
        setNfts([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const userNFTs = await flowNftService.getNFTsForCurrentUser();
        setNfts(userNFTs);
      } catch (err) {
        console.error('Error fetching NFTs:', err);
        setError('Failed to fetch your NFTs. Please try again later.');
        toast.error('Failed to fetch your NFTs');
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [user.loggedIn, user.addr]);

  if (!user.loggedIn) {
    return (
      <div className="bg-dark_grey rounded-xl p-6 text-center">
        <Icon icon="fluent:wallet-24-regular" className="text-5xl text-muted mx-auto mb-4" />
        <h3 className="text-white text-xl mb-2">Connect Your Wallet</h3>
        <p className="text-muted">Connect your Flow wallet to view your NFTs</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-dark_grey rounded-xl p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-white">Loading your NFTs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-dark_grey rounded-xl p-6 text-center">
        <Icon icon="fluent:error-circle-24-regular" className="text-5xl text-red-500 mx-auto mb-4" />
        <h3 className="text-white text-xl mb-2">Error Loading NFTs</h3>
        <p className="text-muted">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 bg-primary text-white px-4 py-2 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div className="bg-dark_grey rounded-xl p-6 text-center">
        <Icon icon="fluent:image-24-regular" className="text-5xl text-muted mx-auto mb-4" />
        <h3 className="text-white text-xl mb-2">No NFTs Found</h3>
        <p className="text-muted">You don't have any AirSpace NFTs in your collection yet.</p>
        <a 
          href="/listings"
          className="mt-4 inline-block bg-primary text-white px-4 py-2 rounded-lg"
        >
          Browse Listings
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-white text-2xl font-medium">Your AirSpace NFTs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nfts.map((nft) => (
          <div key={nft.id} className="bg-dark_grey rounded-xl overflow-hidden">
            <div className="relative h-48">
              {nft.thumbnail ? (
                <img 
                  src={nft.thumbnail} 
                  alt={nft.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-deepSlate">
                  <Icon icon="fluent:building-24-regular" className="text-5xl text-muted" />
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-white text-lg font-medium mb-2">{nft.name}</h3>
              <p className="text-muted text-sm line-clamp-2">{nft.description}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-xs text-muted">ID: {nft.id}</span>
                <a 
                  href={`https://testnet.flowscan.org/nft/${nft.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-sm hover:underline flex items-center"
                >
                  View on FlowScan
                  <Icon icon="heroicons:arrow-top-right-on-square" className="ml-1" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 