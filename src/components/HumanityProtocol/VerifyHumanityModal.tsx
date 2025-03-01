"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHumanityProtocol } from '@/context/HumanityProtocolContext';
import { useZkSyncAuth } from '@/context/ZkSyncAuthContext';
import { toast } from 'react-hot-toast';

interface VerifyHumanityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationComplete: (success: boolean) => void;
}

const VerifyHumanityModal: React.FC<VerifyHumanityModalProps> = ({
  isOpen,
  onClose,
  onVerificationComplete
}) => {
  const { isConnected, address } = useZkSyncAuth();
  const { 
    isLoading, 
    hasCredential, 
    credential, 
    createCredential, 
    verifyCredential 
  } = useHumanityProtocol();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateCredential = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    setIsCreating(true);
    try {
      await createCredential();
      // After creating, automatically verify
      await handleVerifyCredential();
    } finally {
      setIsCreating(false);
    }
  };

  const handleVerifyCredential = async () => {
    if (!hasCredential) {
      toast.error('No credential to verify');
      return;
    }
    
    setIsVerifying(true);
    try {
      const success = await verifyCredential();
      onVerificationComplete(success);
      
      if (success) {
        // Close the modal after a short delay to show the success message
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-darkmode border border-dark_border rounded-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative p-6 border-b border-dark_border">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Verify Humanity</h3>
                  <p className="text-white/60">Required to complete this purchase</p>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full mb-4"
                  />
                  <p className="text-white/70">Loading credential information...</p>
                </div>
              ) : hasCredential ? (
                <div>
                  <div className="bg-success/10 border border-success/30 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 text-success mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      <span className="font-medium">Humanity Credential Found</span>
                    </div>
                    <p className="text-white/70 text-sm">
                      You already have a Humanity Protocol credential. Please verify it to proceed with your purchase.
                    </p>
                  </div>
                  
                  <p className="text-white/70 mb-6">
                    Verifying your credential ensures that you are a real human and helps maintain the integrity of our marketplace.
                  </p>
                  
                  <motion.button
                    onClick={handleVerifyCredential}
                    disabled={isVerifying}
                    className="w-full py-3 px-4 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isVerifying ? (
                      <div className="flex items-center justify-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>Verifying...</span>
                      </div>
                    ) : 'Verify Credential'}
                  </motion.button>
                </div>
              ) : (
                <div>
                  <p className="text-white/70 mb-6">
                    To complete this purchase, you need to verify your humanity using the Humanity Protocol. This helps protect our marketplace from bots and ensures fair access for all users.
                  </p>
                  
                  <div className="bg-white/5 rounded-lg p-4 mb-6">
                    <h4 className="text-white font-medium mb-2">What is Humanity Protocol?</h4>
                    <p className="text-white/70 text-sm mb-4">
                      Humanity Protocol is a decentralized identity verification system that creates a verifiable credential proving you are a real human, without revealing your personal information.
                    </p>
                    <h4 className="text-white font-medium mb-2">Benefits:</h4>
                    <ul className="text-white/70 text-sm space-y-2">
                      <li className="flex items-start gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mt-1">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>One-time verification for all future purchases</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mt-1">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>Protection from bot-driven market manipulation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mt-1">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>Privacy-preserving verification</span>
                      </li>
                    </ul>
                  </div>
                  
                  <motion.button
                    onClick={handleCreateCredential}
                    disabled={isCreating}
                    className="w-full py-3 px-4 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isCreating ? (
                      <div className="flex items-center justify-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>Creating Credential...</span>
                      </div>
                    ) : 'Create & Verify Humanity Credential'}
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VerifyHumanityModal; 