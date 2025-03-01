"use client";

import React from 'react';
import { useHumanityProtocol } from '@/context/HumanityProtocolContext';
import { useZkSyncAuth } from '@/context/ZkSyncAuthContext';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const HumanityCredentialWidget: React.FC = () => {
  const { isConnected, address } = useZkSyncAuth();
  const { 
    isLoading, 
    hasCredential, 
    credential, 
    createCredential 
  } = useHumanityProtocol();

  const handleCreateCredential = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    await createCredential();
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isConnected) {
    return (
      <div className="bg-darkmode border border-dark_border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Humanity Protocol</h3>
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        </div>
        <p className="text-white/70 text-sm">Connect your wallet to view your Humanity Protocol credentials.</p>
      </div>
    );
  }

  return (
    <div className="bg-darkmode border border-dark_border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Humanity Protocol</h3>
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
          />
        </div>
      ) : hasCredential ? (
        <div>
          <div className="flex items-center gap-2 text-success mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span className="font-medium">Verified Human</span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/50">Issued:</span>
              <span className="text-white">{credential?.issuanceDate ? formatDate(credential.issuanceDate) : 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">ID:</span>
              <span className="text-white font-mono">{credential?.id.substring(0, 8)}...</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-dark_border">
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <span>This credential gives you access to exclusive listings and features.</span>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-white/70 text-sm mb-4">
            You don't have a Humanity Protocol credential yet. Create one to verify your humanity.
          </p>
          
          <motion.button
            onClick={handleCreateCredential}
            disabled={isLoading}
            className="w-full py-2 px-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg text-sm font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? 'Creating...' : 'Create Credential'}
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default HumanityCredentialWidget; 