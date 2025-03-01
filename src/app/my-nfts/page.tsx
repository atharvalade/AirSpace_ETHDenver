"use client";

import { useEffect, useState } from "react";
import { useFlow } from "@/context/FlowContext";
import flowNftService from "@/services/flowNftService";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import Link from "next/link";
import Image from "next/image";
import ZkVerificationBadge from "@/components/ZkVerificationBadge";

interface NFT {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  propertyAddress: string;
  currentHeight: number;
  maximumHeight: number;
  availableFloors: number;
  price: string;
}

const MyNFTsPage = () => {
  const { user } = useFlow();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!user.loggedIn) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userNFTs = await flowNftService.getNFTsForCurrentUser();
        setNfts(userNFTs);
        
        // Set all NFTs as verified (mock data)
        const verifiedMap: Record<string, boolean> = {};
        userNFTs.forEach((nft: any) => {
          verifiedMap[nft.id] = true;
        });
        setVerificationStatus(verifiedMap);
      } catch (error) {
        console.error("Error fetching NFTs:", error);
        toast.error("Failed to load your NFTs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [user.loggedIn]);

  if (!user.loggedIn) {
    return (
      <div className="container mx-auto px-4 pt-36 pb-16 min-h-screen">
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-blue-500 flex items-center justify-center">
            <img 
              src="/images/Flow_Logo.png" 
              alt="Flow" 
              className="w-16 h-16" 
            />
          </div>
          <h1 className="text-3xl font-bold mb-4">Connect Your Flow Wallet</h1>
          <p className="text-gray-500 mb-8 max-w-md">
            Please connect your Flow wallet to view your NFTs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-36 pb-16 min-h-screen">
      <div className="flex items-center mb-8">
        <h1 className="text-4xl font-bold">My Air Rights NFTs</h1>
        <img 
          src="/images/Flow_Logo.png" 
          alt="Flow" 
          className="w-12 h-12 ml-4" 
        />
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : nfts.length === 0 ? (
        <div className="bg-dark_grey rounded-lg p-8 text-center">
          <Icon icon="heroicons:photo" className="text-6xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No NFTs Found</h2>
          <p className="text-gray-400 mb-6">
            You don't have any Air Rights NFTs yet. Browse available listings to purchase your first one.
          </p>
          <Link 
            href="/listings"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Icon icon="heroicons:shopping-bag" className="mr-2" />
            Browse Listings
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nfts.map((nft) => (
            <motion.div
              key={nft.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-dark_grey rounded-lg overflow-hidden shadow-lg"
            >
              <div className="relative pb-[56.25%]">
                {nft.thumbnail ? (
                  <img 
                    src={nft.thumbnail} 
                    alt={nft.name} 
                    className="absolute top-0 left-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute top-0 left-0 w-full h-full bg-gray-800 flex items-center justify-center">
                    <Icon icon="heroicons:photo" className="text-4xl text-gray-600" />
                  </div>
                )}
                
                {/* Add ZK Verification Badge in top-right corner */}
                <div className="absolute top-2 right-2">
                  <ZkVerificationBadge 
                    verified={verificationStatus[nft.id] || false}
                    proofId={`proof-${nft.id}`}
                    system="groth16"
                    className="bg-black bg-opacity-50 p-1 rounded-md"
                  />
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{nft.name}</h3>
                <p className="text-gray-400 mb-4">{nft.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Property Address:</span>
                    <span className="font-medium">{nft.propertyAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current Height:</span>
                    <span className="font-medium">{nft.currentHeight} meters</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Maximum Height:</span>
                    <span className="font-medium">{nft.maximumHeight} meters</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Available Floors:</span>
                    <span className="font-medium">{nft.availableFloors}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price Paid:</span>
                    <span className="font-medium">{nft.price} ETH</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <a 
                    href={`https://testnet.flowscan.io/account/${user?.addr}/collection`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 flex items-center"
                  >
                    <Icon icon="heroicons:arrow-top-right-on-square" className="mr-1" />
                    View on FlowScan
                  </a>
                  
                  <button className="flex items-center text-gray-400 hover:text-white">
                    <Icon icon="heroicons:share" className="mr-1" />
                    Share
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyNFTsPage; 