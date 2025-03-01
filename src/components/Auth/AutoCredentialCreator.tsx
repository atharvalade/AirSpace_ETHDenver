"use client";

import { useEffect, useRef, useState } from 'react';
import { useHumanityProtocol } from '@/context/HumanityProtocolContext';
import { useZkSyncAuth } from '@/context/ZkSyncAuthContext';
import { toast } from 'react-hot-toast';

const AutoCredentialCreator = () => {
  const { createCredential, hasCredential, isFallbackMode } = useHumanityProtocol();
  const { isNewWallet, address, isConnected } = useZkSyncAuth();
  const hasAttemptedCreation = useRef(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Automatically create a credential when a new wallet is connected
  useEffect(() => {
    const handleNewWallet = async () => {
      // Only create a credential if:
      // 1. This is a new wallet
      // 2. The user is connected
      // 3. We have an address
      // 4. The user doesn't already have a credential
      // 5. We haven't already attempted to create a credential in this session
      // 6. We're not currently in the process of creating a credential
      if (isNewWallet && isConnected && address && !hasCredential && !hasAttemptedCreation.current && !isCreating) {
        try {
          console.log("Creating credential for new wallet:", address);
          if (isFallbackMode) {
            console.log("Using fallback mode for credential creation");
          }
          
          hasAttemptedCreation.current = true; // Mark that we've attempted creation
          setIsCreating(true);
          
          // Show a toast notification
          const toastId = toast.loading('Creating Humanity credential...');
          
          // Create a new Humanity Protocol credential for the new wallet
          await createCredential();
          
          // Update the toast
          toast.dismiss(toastId);
        } catch (error) {
          console.error("Failed to automatically create credential:", error);
          toast.error("Failed to create Humanity credential automatically");
        } finally {
          setIsCreating(false);
        }
      }
    };
    
    handleNewWallet();
  }, [isNewWallet, isConnected, address, hasCredential, createCredential, isCreating, isFallbackMode]);
  
  // Reset the attempt flag when the address changes
  useEffect(() => {
    if (address) {
      hasAttemptedCreation.current = false;
    }
  }, [address]);
  
  // Reset the attempt flag when fallback mode changes
  useEffect(() => {
    hasAttemptedCreation.current = false;
  }, [isFallbackMode]);
  
  return null; // This component doesn't render anything
};

export default AutoCredentialCreator; 