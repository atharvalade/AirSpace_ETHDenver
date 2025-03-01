import { motion } from "framer-motion";

interface MarketMetricsProps {
  metrics: {
    totalVolume: string;
    totalTransactions: number;
    activeWallets: number;
    averagePrice: string;
    highestSale: string;
    mintedNFTs: number;
  };
}

const MarketMetrics = ({ metrics }: MarketMetricsProps) => {
  return (
    <>
      <h2 className="text-2xl font-bold mb-6">Market Metrics</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <motion.div 
          className="bg-deepSlate p-5 rounded-xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-muted text-sm mb-2">Total Volume</p>
          <p className="text-primary text-2xl font-bold">${metrics.totalVolume}</p>
        </motion.div>
        
        <motion.div 
          className="bg-deepSlate p-5 rounded-xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <p className="text-muted text-sm mb-2">Transactions</p>
          <p className="text-white text-2xl font-bold">{metrics.totalTransactions}</p>
        </motion.div>
        
        <motion.div 
          className="bg-deepSlate p-5 rounded-xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <p className="text-muted text-sm mb-2">Active Wallets</p>
          <p className="text-white text-2xl font-bold">{metrics.activeWallets}</p>
        </motion.div>
        
        <motion.div 
          className="bg-deepSlate p-5 rounded-xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <p className="text-muted text-sm mb-2">Average Price</p>
          <p className="text-primary text-2xl font-bold">${metrics.averagePrice}</p>
        </motion.div>
        
        <motion.div 
          className="bg-deepSlate p-5 rounded-xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <p className="text-muted text-sm mb-2">Highest Sale</p>
          <p className="text-primary text-2xl font-bold">${metrics.highestSale}</p>
        </motion.div>
        
        <motion.div 
          className="bg-deepSlate p-5 rounded-xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <p className="text-muted text-sm mb-2">Minted NFTs</p>
          <p className="text-white text-2xl font-bold">{metrics.mintedNFTs}</p>
        </motion.div>
      </div>
    </>
  );
};

export default MarketMetrics; 