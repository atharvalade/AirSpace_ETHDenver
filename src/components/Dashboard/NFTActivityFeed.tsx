import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Icon } from "@iconify/react";
import ZkVerificationBadge from "@/components/ZkVerificationBadge";

interface Transaction {
  id: string;
  type: "Transfer" | "Mint" | "Sale" | "Verification";
  tokenId: number;
  from: string;
  to: string;
  timestamp: number;
  value: string;
  network: "Flow" | "zkSync";
  verified: boolean;
  proofId?: string;
}

interface NFTActivityFeedProps {
  transactions: Transaction[];
}

const NFTActivityFeed = ({ transactions }: NFTActivityFeedProps) => {
  const [displayedTransactions, setDisplayedTransactions] = useState<Transaction[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  
  useEffect(() => {
    if (autoScroll) {
      setDisplayedTransactions(transactions.slice(0, 5));
    }
  }, [transactions, autoScroll]);
  
  const getNetworkIcon = (network: string) => {
    switch (network) {
      case "Flow": return "simple-icons:flow";
      case "zkSync": return "simple-icons:zksync";
      default: return "heroicons:globe-alt";
    }
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Mint": return "heroicons:hammer";
      case "Transfer": return "heroicons:arrow-path";
      case "Sale": return "heroicons:banknotes";
      case "Verification": return "heroicons:shield-check";
      default: return "heroicons:document-text";
    }
  };
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case "Mint": return "bg-blue-500";
      case "Transfer": return "bg-purple-500";
      case "Sale": return "bg-green-500";
      case "Verification": return "bg-amber-500";
      default: return "bg-gray-500";
    }
  };

  const formatAddress = (address: string) => {
    if (address === "0x0000...0000") return "New Mint";
    return address;
  };
  
  const getExplorerLink = (id: string, network: string) => {
    if (network === "Flow") {
      return `https://flowscan.org/transaction/${id}`;
    } else if (network === "zkSync") {
      return `https://explorer.zksync.io/tx/${id}`;
    }
    return `https://etherscan.io/tx/${id}`;
  };
  
  const getExplorerName = (network: string) => {
    if (network === "Flow") return "FlowScan";
    if (network === "zkSync") return "zkSync Explorer";
    return "Etherscan";
  };

  return (
    <div className="bg-dark_grey rounded-xl p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Icon icon="heroicons:bolt" className="mr-2 text-primary" />
          Live Activity Feed
        </h2>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-2 rounded-full ${autoScroll ? 'bg-primary text-darkmode' : 'bg-deepSlate text-white'}`}
            title={autoScroll ? "Auto-scroll enabled" : "Auto-scroll disabled"}
          >
            <Icon icon="heroicons:arrow-path" className={`w-5 h-5 ${autoScroll ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
        <AnimatePresence>
          {displayedTransactions.map((tx, index) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-deepSlate rounded-xl p-4 border-l-4 border-primary relative overflow-hidden group"
            >
              {/* Network indicator */}
              <div className="absolute top-2 right-2 flex items-center space-x-1 bg-darkmode bg-opacity-50 rounded-full px-2 py-1">
                <Icon icon={getNetworkIcon(tx.network)} className="w-4 h-4" />
                <span className="text-xs font-medium">{tx.network}</span>
              </div>
              
              {/* Transaction content */}
              <div className="flex items-start">
                <div className={`${getTypeColor(tx.type)} w-12 h-12 rounded-full flex items-center justify-center text-lg mr-4 flex-shrink-0`}>
                  <Icon icon={getTypeIcon(tx.type)} className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-white text-lg">
                      {tx.type} NFT #{tx.tokenId}
                    </h3>
                    <span className="text-xs text-muted ml-2 flex-shrink-0">
                      {formatDistanceToNow(new Date(tx.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted text-sm">From:</span>
                      <span className="text-white font-mono text-xs bg-darkmode rounded-md px-2 py-1">
                        {formatAddress(tx.from)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted text-sm">To:</span>
                      <span className="text-white font-mono text-xs bg-darkmode rounded-md px-2 py-1">
                        {formatAddress(tx.to)}
                      </span>
                    </div>
                    {tx.value && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted text-sm">Value:</span>
                        <span className="text-primary font-medium bg-darkmode rounded-md px-2 py-1">
                          ${parseInt(tx.value).toLocaleString()} USDC
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 flex justify-between items-center">
                    <a 
                      href={getExplorerLink(tx.id, tx.network)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center text-sm"
                    >
                      <Icon icon="heroicons:arrow-top-right-on-square" className="mr-1 w-4 h-4" />
                      View on {getExplorerName(tx.network)}
                    </a>
                    
                    <ZkVerificationBadge 
                      verified={tx.verified}
                      proofId={tx.proofId || `proof-${tx.id.substring(0, 8)}`}
                      system="groth16"
                      className="scale-75 origin-right"
                    />
                  </div>
                </div>
              </div>
              
              {/* Hover effect - subtle glow */}
              <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-xl"></div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NFTActivityFeed; 