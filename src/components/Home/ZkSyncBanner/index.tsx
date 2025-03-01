"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useZkSyncAuth } from '@/context/ZkSyncAuthContext';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import ZkSyncOnboardingModal from '@/components/Auth/ZkSyncOnboardingModal';

const ZkSyncBanner = () => {
  const { isConnected, isConnecting, address } = useZkSyncAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  const openOnboardingModal = () => {
    setIsOnboardingModalOpen(true);
  };

  const closeOnboardingModal = () => {
    setIsOnboardingModalOpen(false);
  };

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <>
      <div className="bg-gradient-to-r from-[#4E529A] to-[#8C8DFC] py-8 px-4 md:px-8">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row items-center justify-between gap-6 text-white"
          >
            <div className="flex items-center gap-4">
              <motion.img 
                src="/images/zksync-logo.svg" 
                alt="zkSync Logo" 
                className="w-12 h-12"
                animate={{ 
                  rotate: isHovered ? 360 : 0,
                  scale: isHovered ? 1.1 : 1
                }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              />
              <div>
                <h3 className="text-xl font-bold">Powered by zkSync SSO</h3>
                <p className="text-white/80">Experience Web2-like authentication with blockchain security</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {!isConnected ? (
                <motion.button
                  onClick={openOnboardingModal}
                  disabled={isConnecting}
                  className="bg-white text-[#4E529A] px-6 py-3 rounded-lg font-medium hover:bg-white/90 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isConnecting ? 'Connecting...' : 'Connect with Passkeys'}
                </motion.button>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg font-medium border border-white/30"
                >
                  <span className="text-white">Connected: {formatAddress(address!)}</span>
                </motion.div>
              )}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  href="https://docs.zksync.io/zksync-era/unique-features/zksync-sso/getting-started" 
                  target="_blank"
                  className="border border-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors text-center block"
                >
                  Learn About zkSync SSO
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Onboarding Modal */}
      <ZkSyncOnboardingModal 
        isOpen={isOnboardingModalOpen} 
        onClose={closeOnboardingModal} 
      />
    </>
  );
};

export default ZkSyncBanner; 