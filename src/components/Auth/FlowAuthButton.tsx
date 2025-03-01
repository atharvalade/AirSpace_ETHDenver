"use client";

import React, { useState, useEffect } from 'react';
import { useFlow } from '@/context/FlowContext';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import flowConfig from '@/config/flow';
import * as fcl from '@onflow/fcl';

const FlowAuthButton: React.FC = () => {
  const { user, isLoading, connectWithFlow, disconnectFromFlow, setupAccount, isAccountSetup, checkingAccountSetup } = useFlow();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isDropdownOpen && !target.closest('.flow-dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Fetch balance when dropdown opens
  useEffect(() => {
    if (isDropdownOpen && user.addr && balance === null) {
      fetchBalance();
    }
  }, [isDropdownOpen, user.addr, balance]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleConnect = async () => {
    try {
      console.log("Attempting to connect to Flow wallet...");
      await connectWithFlow();
      console.log("Flow wallet connection successful");
      toast.success('Connected to Flow wallet');
    } catch (err) {
      console.error("Flow wallet connection error:", err);
      toast.error('Failed to connect to Flow. Please try again.');
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectFromFlow();
      setIsDropdownOpen(false);
      toast.success('Disconnected from Flow wallet');
    } catch (err) {
      console.error(err);
      toast.error('Failed to disconnect. Please try again.');
    }
  };

  const handleSetupAccount = async () => {
    try {
      await setupAccount();
      setIsDropdownOpen(false);
      toast.success('Account set up for NFTs');
    } catch (err) {
      console.error(err);
      toast.error('Failed to set up account. Please try again.');
    }
  };

  // Copy address to clipboard
  const copyAddressToClipboard = () => {
    if (user.addr) {
      navigator.clipboard.writeText(user.addr)
        .then(() => {
          toast.success('Address copied to clipboard');
        })
        .catch((err) => {
          console.error('Failed to copy address:', err);
          toast.error('Failed to copy address');
        });
    }
  };

  // Fetch Flow token balance
  const fetchBalance = async () => {
    if (!user.addr) return;
    
    try {
      setLoadingBalance(true);
      
      // Try using FCL query first
      try {
        const response = await fcl.query({
          cadence: `
            pub fun main(address: Address): UFix64 {
              let account = getAccount(address)
              return account.balance
            }
          `,
          args: (arg: any, t: any) => [arg(user.addr, t.Address)]
        });
        
        console.log("FCL Balance response:", response);
        
        if (response) {
          const flowBalance = parseFloat(response);
          setBalance(flowBalance.toFixed(4));
          return;
        }
      } catch (err) {
        console.error("Error with FCL balance fetch:", err);
        // Continue to fallback method
      }
      
      // Fallback: Use the Flow View API directly
      try {
        // Format address without 0x prefix for API
        const addr = user.addr.startsWith('0x') ? user.addr.substring(2) : user.addr;
        
        // Make a direct API call to get account info
        const response = await fetch(`https://rest-testnet.onflow.org/v1/accounts/${addr}`);
        const data = await response.json();
        
        console.log("API Balance response:", data);
        
        if (data && data.balance) {
          // Convert from smallest unit to FLOW (1 FLOW = 10^8 units)
          const flowBalance = parseFloat(data.balance) / 100000000;
          setBalance(flowBalance.toFixed(4));
          return;
        } else {
          throw new Error("No balance data in API response");
        }
      } catch (apiErr) {
        console.error("Error with API balance fetch:", apiErr);
        throw apiErr; // Re-throw to be caught by the outer catch
      }
    } catch (error) {
      console.error("All balance fetch methods failed:", error);
      setBalance("Error");
    } finally {
      setLoadingBalance(false);
    }
  };

  // Reset balance state
  const resetBalance = () => {
    setBalance(null);
    fetchBalance();
  };

  // Get FlowScan URL for the current network
  const getFlowScanUrl = () => {
    const network = flowConfig.NETWORK;
    const baseUrl = network === 'mainnet' 
      ? 'https://flowscan.io' 
      : `https://${network}.flowscan.io`;
    
    return `${baseUrl}/account/${user.addr}`;
  };

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="relative flow-dropdown-container">
      {user.loggedIn ? (
        <div>
          <motion.button
            onClick={toggleDropdown}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isLoading}
          >
            <div className="flex items-center">
              <img 
                src="/images/Flow_Logo.png" 
                alt="Flow" 
                className="w-5 h-5 mr-2" 
              />
              {user.addr ? formatAddress(user.addr) : 'Connected'}
            </div>
            <Icon icon="heroicons:chevron-down" className="ml-2 text-sm" />
          </motion.button>

          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-64 bg-darkmode border border-dark_border rounded-lg shadow-lg z-50"
            >
              {user.addr && (
                <div className="p-3 border-b border-dark_border">
                  <div className="text-white text-sm font-medium mb-1">Wallet Details</div>
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted">Address:</span>
                      <div className="flex items-center">
                        <span className="text-xs text-white font-mono">{user.addr}</span>
                        <button 
                          onClick={copyAddressToClipboard}
                          className="ml-1 text-muted hover:text-white transition-colors"
                          title="Copy address"
                        >
                          <Icon icon="heroicons:clipboard-document" className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted">Network:</span>
                      <span className="text-xs text-white">{flowConfig.NETWORK}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted">Status:</span>
                      <span className="text-xs text-green-400 flex items-center">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                        Connected
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted">FLOW Balance:</span>
                      {loadingBalance ? (
                        <span className="text-xs text-white">Loading...</span>
                      ) : balance === "Error" ? (
                        <div className="flex items-center">
                          <span className="text-xs text-red-400">Failed to load</span>
                          <button 
                            onClick={resetBalance} 
                            className="ml-1 text-muted hover:text-white transition-colors"
                            title="Try again"
                          >
                            <Icon icon="heroicons:arrow-path" className="w-3 h-3" />
                          </button>
                        </div>
                      ) : balance ? (
                        <div className="flex items-center">
                          <span className="text-xs text-white">{balance} FLOW</span>
                          <button 
                            onClick={fetchBalance} 
                            className="ml-1 text-muted hover:text-white transition-colors"
                            title="Refresh balance"
                          >
                            <Icon icon="heroicons:arrow-path" className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span className="text-xs text-white">1000.0000 FLOW</span>
                          <span className="ml-1 text-xs text-gray-400">(Demo)</span>
                        </div>
                      )}
                    </div>
                    {isAccountSetup && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted">NFT Collection:</span>
                        <span className="text-xs text-green-400 flex items-center">
                          <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                          Ready
                        </span>
                      </div>
                    )}
                    
                    {/* Debug info - only visible in development */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="mt-2 pt-2 border-t border-dark_border">
                        <div className="text-xs text-muted mb-1">Debug Info:</div>
                        <div className="text-xs text-white break-all">
                          <div>Network: {flowConfig.NETWORK}</div>
                          <div>Access Node: {flowConfig.FLOW_ACCESS_NODE}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="p-2">
                {!isAccountSetup && !checkingAccountSetup && (
                  <button
                    onClick={handleSetupAccount}
                    className="w-full text-left px-4 py-2 text-white hover:bg-dark_border rounded transition-colors duration-200 flex items-center"
                    disabled={isLoading}
                  >
                    <Icon icon="heroicons:cube-transparent" className="mr-2" />
                    Setup NFT Collection
                  </button>
                )}
                <button
                  onClick={handleDisconnect}
                  className="w-full text-left px-4 py-2 text-white hover:bg-dark_border rounded transition-colors duration-200 flex items-center"
                  disabled={isLoading}
                >
                  <Icon icon="heroicons:arrow-right-on-rectangle" className="mr-2" />
                  Disconnect
                </button>
                {user.addr && (
                  <a
                    href={getFlowScanUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-left px-4 py-2 text-white hover:bg-dark_border rounded transition-colors duration-200 flex items-center"
                  >
                    <Icon icon="heroicons:arrow-top-right-on-square" className="mr-2" />
                    View on FlowScan
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        <motion.button
          onClick={handleConnect}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <div className="flex items-center">
                <img 
                  src="/images/Flow_Logo.png" 
                  alt="Flow" 
                  className="w-5 h-5 mr-2" 
                />
                Connect Flow Wallet
              </div>
            </>
          )}
        </motion.button>
      )}
    </div>
  );
};

export default FlowAuthButton; 