"use client";

import React, { useState } from 'react';
import { useZkSyncAuth } from '@/context/ZkSyncAuthContext';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import ZkSyncOnboardingModal from '@/components/Auth/ZkSyncOnboardingModal';

const ZkSyncAccountInfo = () => {
  const { isConnected, isConnecting, address } = useZkSyncAuth();
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  const openOnboardingModal = () => {
    setIsOnboardingModalOpen(true);
  };

  const closeOnboardingModal = () => {
    setIsOnboardingModalOpen(false);
  };

  if (!isConnected || !address) {
    return (
      <>
        <div className="bg-darkmode border border-dark_border rounded-xl p-6 h-full">
          <div className="flex items-center gap-3 mb-4">
            <img 
              src="/images/zksync-logo.svg" 
              alt="zkSync" 
              className="w-8 h-8" 
            />
            <h3 className="text-xl font-semibold text-white">zkSync Account</h3>
          </div>
          <div className="text-white/70 text-center py-6">
            <p className="mb-4">Connect with zkSync SSO to view your account information</p>
            <motion.button
              onClick={openOnboardingModal}
              disabled={isConnecting}
              className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-300 flex items-center gap-2 mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img 
                src="/images/zksync-logo.svg" 
                alt="zkSync" 
                className="w-5 h-5" 
              />
              {isConnecting ? 'Connecting...' : 'Connect with zkSync'}
            </motion.button>
          </div>
        </div>

        {/* Onboarding Modal */}
        <ZkSyncOnboardingModal 
          isOpen={isOnboardingModalOpen} 
          onClose={closeOnboardingModal} 
        />
      </>
    );
  }

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 10)}...${address.substring(address.length - 8)}`;
  };

  // Copy address to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard!');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-darkmode border border-dark_border rounded-xl p-6 h-full"
    >
      <div className="flex items-center gap-3 mb-6">
        <motion.img 
          src="/images/zksync-logo.svg" 
          alt="zkSync" 
          className="w-8 h-8"
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.8 }}
        />
        <h3 className="text-xl font-semibold text-white">zkSync Account</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <p className="text-white/50 text-sm mb-1">Account Address</p>
          <div className="flex items-center gap-2">
            <p className="text-white font-mono">{formatAddress(address)}</p>
            <motion.button 
              onClick={copyToClipboard}
              className="text-primary hover:text-primary/80 transition-colors"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </motion.button>
          </div>
        </div>
        
        <div>
          <p className="text-white/50 text-sm mb-1">Authentication Method</p>
          <div className="flex items-center gap-2 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <p>Passkey Authentication (No Seed Phrase)</p>
          </div>
        </div>
        
        <div>
          <p className="text-white/50 text-sm mb-1">Network</p>
          <p className="text-white">zkSync Era Sepolia Testnet</p>
        </div>
        
        <div className="pt-2">
          <motion.a 
            href={`https://sepolia-era.zksync.network/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            whileHover={{ x: 3 }}
          >
            <span>View on Explorer</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
};

export default ZkSyncAccountInfo; 