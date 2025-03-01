"use client";

import React, { useState } from 'react';
import { useHumanityProtocol } from '@/context/HumanityProtocolContext';
import { useZkSyncAuth } from '@/context/ZkSyncAuthContext';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface HumanityCredentialCardProps {
  onVerificationComplete?: (success: boolean) => void;
}

const HumanityCredentialCard: React.FC<HumanityCredentialCardProps> = ({ 
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

  const handleCreateCredential = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    await createCredential();
  };

  const handleVerifyCredential = async () => {
    if (!hasCredential) {
      toast.error('No credential to verify');
      return;
    }
    
    setIsVerifying(true);
    try {
      const success = await verifyCredential();
      if (onVerificationComplete) {
        onVerificationComplete(success);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isConnected) {
    return (
      <div className="bg-darkmode border border-dark_border rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Humanity Protocol</h3>
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        </div>
        <p className="text-white/70 mb-6">Connect your wallet to manage your Humanity Protocol credentials.</p>
      </div>
    );
  }

  return (
    <div className="bg-darkmode border border-dark_border rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Humanity Protocol</h3>
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
      </div>
      
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
              <span className="font-medium">Verified Human</span>
            </div>
            <p className="text-white/70 text-sm">
              Your wallet has been verified as belonging to a human.
            </p>
          </div>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-white/50">Credential ID:</span>
              <span className="text-white font-mono text-sm">{credential?.id.substring(0, 16)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Issued:</span>
              <span className="text-white">{credential?.issuanceDate ? formatDate(credential.issuanceDate) : 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Wallet:</span>
              <span className="text-white font-mono text-sm">
                {address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : 'Unknown'}
              </span>
            </div>
          </div>
          
          <motion.button
            onClick={handleVerifyCredential}
            disabled={isVerifying}
            className="w-full py-3 px-4 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isVerifying ? 'Verifying...' : 'Verify Credential'}
          </motion.button>
        </div>
      ) : (
        <div>
          <p className="text-white/70 mb-6">
            You don't have a Humanity Protocol credential yet. Create one to verify your humanity and access enhanced features.
          </p>
          
          <div className="bg-white/5 rounded-lg p-4 mb-6">
            <h4 className="text-white font-medium mb-2">Benefits of Humanity Verification:</h4>
            <ul className="text-white/70 text-sm space-y-2">
              <li className="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mt-1">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Access to exclusive listings</span>
              </li>
              <li className="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mt-1">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Enhanced trust in transactions</span>
              </li>
              <li className="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mt-1">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Protection from bot-driven market manipulation</span>
              </li>
            </ul>
          </div>
          
          <motion.button
            onClick={handleCreateCredential}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? 'Creating...' : 'Create Humanity Credential'}
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default HumanityCredentialCard; 