"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { NFT } from "@/types/nft";
import LiveActivityFeed, { Transaction as LiveTransaction } from "./LiveActivityFeed";
import MarketMetrics from "./MarketMetrics";
import TransactionHistory from "./TransactionHistory";
import NFTGallery from "./NFTGallery";
import NetworkStatus from "./NetworkStatus";
import ZkSyncAccountInfo from "./ZkSyncAccountInfo";
import HumanityCredentialWidget from "./HumanityCredentialWidget";
import dynamic from "next/dynamic";

// Dynamically import the map component with no SSR
const GlobalActivityMap = dynamic(() => import("./GlobalActivityMap"), {
  ssr: false,
});

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
      };
    };
  };
}

interface ApiResponse {
  data: ApiNFT[];
  wallet: string;
}

// Define local Transaction type for TransactionHistory
interface DashboardTransaction {
  id: string;
  type: string;
  tokenId: number;
  from: string;
  to: string;
  timestamp: number;
  value: string;
  gasUsed: string;
}

// Mock transaction data (will be replaced with HyperSync data)
const mockTransactions: LiveTransaction[] = [
  {
    id: "0x157eafce...bb9f",
    type: "Transfer",
    tokenId: 5,
    from: "0x157eafce...bb9f",
    to: "0x282f570d...7611",
    timestamp: Date.now() - 60000, // less than a minute ago
    value: "428366",
    network: "zkSync",
    verified: true,
    proofId: "proof-zk-1234"
  },
  {
    id: "0x35a1cb8c...027a",
    type: "Transfer",
    tokenId: 5,
    from: "0x35a1cb8c...027a",
    to: "0xa4f86926...e585",
    timestamp: Date.now() - 60000 * 1, // 1 minute ago
    value: "488515",
    network: "zkSync",
    verified: true,
    proofId: "proof-zk-5678"
  },
  {
    id: "0x0000...0000",
    type: "Mint",
    tokenId: 2,
    from: "0x0000...0000",
    to: "0xa20C...D5D",
    timestamp: Date.now() - 3600000 * 2, // 2 hours ago
    value: "250000",
    network: "Flow",
    verified: true,
    proofId: "proof-flow-9012"
  },
  {
    id: "0x2b3c4d5e6f7g",
    type: "Verification",
    tokenId: 3,
    from: "0xa20C...D5D",
    to: "0xa20C...D5D", // Same address for verification
    timestamp: Date.now() - 3600000 * 3, // 3 hours ago
    value: "",
    network: "Flow",
    verified: true,
    proofId: "proof-flow-3456"
  },
  {
    id: "0x3c4d5e6f7g8h",
    type: "Sale",
    tokenId: 4,
    from: "0xb30D...E6E",
    to: "0xc41E...F7F",
    timestamp: Date.now() - 3600000 * 4, // 4 hours ago
    value: "350000",
    network: "Flow",
    verified: true,
    proofId: "proof-flow-7890"
  }
];

// Mock market metrics (will be replaced with HyperSync data)
const mockMetrics = {
  totalVolume: "1,725,000",
  totalTransactions: 27,
  activeWallets: 18,
  averagePrice: "345,000",
  highestSale: "580,000",
  mintedNFTs: 6,
};

const Dashboard = () => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [transactions, setTransactions] = useState<LiveTransaction[]>(mockTransactions);
  const [dashboardTransactions, setDashboardTransactions] = useState<DashboardTransaction[]>([]);
  const [metrics, setMetrics] = useState(mockMetrics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        const response = await fetch("https://apinft-zeta.vercel.app/api/nfts");
        if (!response.ok) {
          throw new Error("Failed to fetch NFTs");
        }
        const apiResponse: ApiResponse = await response.json();

        // Transform API data to match our NFT interface
        const transformedNFTs: NFT[] = apiResponse.data.map((item) => {
          // Find attributes by trait_type
          const getAttributeValue = (traitType: string) => {
            const attr = item.metadata.attributes.find(
              (a) => a.trait_type === traitType
            );
            return attr ? String(attr.value) : "";
          };

          return {
            id: item.tokenId.toString(),
            title: item.metadata.title,
            name: item.metadata.name,
            description: item.metadata.description,
            thumbnail: `/images/nft-${item.tokenId % 5 + 1}.jpg`, // Placeholder images
            propertyAddress: getAttributeValue("property_address"),
            currentHeight: parseInt(getAttributeValue("current_height") || "0"),
            maximumHeight: parseInt(getAttributeValue("maximum_height") || "0"),
            availableFloors: parseInt(getAttributeValue("available_floors") || "0"),
            price: parseInt(getAttributeValue("price") || "0"),
            token_id: item.tokenId,
            contract_address: "0x1234...5678", // Placeholder
            latitude: item.metadata.properties?.coordinates?.latitude || 0,
            longitude: item.metadata.properties?.coordinates?.longitude || 0
          };
        });

        setNfts(transformedNFTs);
        
        // Convert LiveTransactions to DashboardTransactions for TransactionHistory
        const historyTransactions: DashboardTransaction[] = transactions.map(tx => ({
          id: tx.id,
          type: tx.type,
          tokenId: tx.tokenId,
          from: tx.from,
          to: tx.to,
          timestamp: tx.timestamp,
          value: tx.value,
          gasUsed: "0.0025" // Placeholder gas value
        }));
        setDashboardTransactions(historyTransactions);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching NFTs:", err);
        setError("Failed to load NFTs. Please try again later.");
        setLoading(false);
      }
    };

    // Function to simulate real-time updates
    const simulateRealTimeUpdates = () => {
      const interval = setInterval(() => {
        // Generate a random transaction
        const networks = ["Flow", "zkSync"] as const;
        const types = ["Transfer", "Mint", "Sale", "Verification"] as const;
        const network = networks[Math.floor(Math.random() * networks.length)];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const newTransaction: LiveTransaction = {
          id: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
          type: type,
          tokenId: Math.floor(Math.random() * 10) + 1,
          from: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
          to: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
          timestamp: Date.now(),
          value: type === "Verification" ? "" : (Math.floor(Math.random() * 500000) + 100000).toString(),
          network: network,
          verified: Math.random() > 0.2, // 80% chance of being verified
          proofId: `proof-${network.toLowerCase()}-${Math.floor(Math.random() * 10000)}`
        };
        
        // Add the new transaction to the state
        setTransactions(prev => [newTransaction, ...prev.slice(0, 19)]);
        
        // Update metrics
        setMetrics(prev => {
          const newVolume = type !== "Verification" 
            ? parseInt(prev.totalVolume.replace(/,/g, "")) + parseInt(newTransaction.value)
            : parseInt(prev.totalVolume.replace(/,/g, ""));
          
          const newAvgPrice = type !== "Verification"
            ? ((parseInt(prev.averagePrice.replace(/,/g, "")) * 0.95) + (parseInt(newTransaction.value) * 0.05)).toFixed(0)
            : prev.averagePrice;
          
          return {
            ...prev,
            totalTransactions: prev.totalTransactions + 1,
            totalVolume: newVolume.toLocaleString(),
            averagePrice: newAvgPrice.toLocaleString()
          };
        });
      }, 15000); // Add a new transaction every 15 seconds
      
      return interval;
    };

    fetchNFTs();
    
    // Start the real-time updates
    const interval = simulateRealTimeUpdates();
    return () => {
      if (typeof interval === 'number') {
        clearInterval(interval);
      }
    };
  }, []);
  
  // Update dashboardTransactions when transactions change
  useEffect(() => {
    const historyTransactions: DashboardTransaction[] = transactions.map(tx => ({
      id: tx.id,
      type: tx.type,
      tokenId: tx.tokenId,
      from: tx.from,
      to: tx.to,
      timestamp: tx.timestamp,
      value: tx.value,
      gasUsed: "0.0025" // Placeholder gas value
    }));
    setDashboardTransactions(historyTransactions);
  }, [transactions]);

  return (
    <div className="container mx-auto px-4 py-8 pt-32">
      <motion.h1
        className="text-4xl font-bold mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Web3 Dashboard
      </motion.h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-500 bg-opacity-20 text-red-700 p-4 rounded-lg mb-8">
          {error}
        </div>
      ) : (
        <>
          <p className="text-muted mb-10">
            Monitor your NFT portfolio, track transactions, and view market metrics.
          </p>

          {/* Market Metrics - Full Width First Row */}
          <div className="mb-8">
            <div className="bg-dark_grey bg-opacity-35 rounded-3xl p-8">
              <MarketMetrics metrics={metrics} />
            </div>
          </div>

          {/* Network Status and zkSync Account - Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="bg-dark_grey bg-opacity-35 rounded-3xl p-8">
              <NetworkStatus />
            </div>
            <div className="bg-dark_grey bg-opacity-35 rounded-3xl p-8">
              <ZkSyncAccountInfo />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            <div className="bg-dark_grey bg-opacity-35 rounded-3xl p-8">
              <h2 className="text-2xl font-bold mb-6">Live Activity</h2>
              <LiveActivityFeed transactions={transactions} className="h-[400px] overflow-y-auto" />
            </div>
            <div className="bg-dark_grey bg-opacity-35 rounded-3xl p-8">
              <h2 className="text-2xl font-bold mb-6">Transaction History</h2>
              <TransactionHistory 
                transactions={dashboardTransactions} 
                nfts={nfts} 
                selectedNFT={selectedNFT} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 mb-10">
            <div className="bg-dark_grey bg-opacity-35 rounded-3xl p-8">
              <h2 className="text-2xl font-bold mb-6">My NFT Portfolio</h2>
              <NFTGallery 
                nfts={nfts} 
                selectedNFT={selectedNFT} 
                onSelect={(nft) => setSelectedNFT(nft)} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <div className="bg-dark_grey bg-opacity-35 rounded-3xl p-8">
              <h2 className="text-2xl font-bold mb-6">Global Activity Map</h2>
              <GlobalActivityMap nfts={nfts} transactions={dashboardTransactions} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard; 