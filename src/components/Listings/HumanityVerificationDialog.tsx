"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/SharedComponent/Dialog';
import { Button } from '@/components/SharedComponent/Button';
import { useHumanityProtocol } from '@/context/HumanityProtocolContext';
import { useZkSyncAuth } from '@/context/ZkSyncAuthContext';
import { Icon } from '@iconify/react';
import Image from 'next/image';

interface HumanityVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
}

const HumanityVerificationDialog: React.FC<HumanityVerificationDialogProps> = ({
  isOpen,
  onClose,
  onVerified
}) => {
  const { verifyCredential, hasCredential, createCredential, isFallbackMode } = useHumanityProtocol();
  const { address } = useZkSyncAuth();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Log fallback mode status but don't show in UI
  useEffect(() => {
    if (isFallbackMode) {
      console.log('Humanity Protocol service is running in fallback mode');
    }
  }, [isFallbackMode]);

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setIsVerifying(false);
      setIsVerified(false);
      setError(null);
    }
  }, [isOpen]);

  const handleVerify = async () => {
    if (!address) {
      setError("Wallet not connected");
      return;
    }

    try {
      setIsVerifying(true);
      setError(null);
      
      // If the user doesn't have a credential, create one first
      if (!hasCredential) {
        await createCredential();
      }
      
      // Verify the credential
      const verified = await verifyCredential();
      
      if (verified) {
        setIsVerified(true);
        // Wait a moment before closing to show success state
        setTimeout(() => {
          onVerified();
          onClose();
        }, 1500);
      } else {
        setError("Verification failed. Please try again or create a new credential.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("An error occurred during verification. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-dark_grey text-white border-0">
        {/* Logo centered at the top with prominent styling */}
        <div className="flex justify-center -mt-12 mb-6">
          <div className="h-24 w-24 bg-white rounded-full p-2 shadow-lg shadow-primary/20 border-4 border-primary/30">
            <div className="relative h-full w-full">
              <Image 
                src="/images/Humanity_Protocol.png" 
                alt="Humanity Protocol" 
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
        
        <DialogHeader className="pb-4 border-b border-gray-700">
          <DialogTitle className="text-center text-2xl font-semibold">
            Humanity Verification
          </DialogTitle>
          <DialogDescription className="text-gray-300 mt-2 text-center">
            Verify your humanity credential before proceeding with the purchase.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6">
          {!hasCredential ? (
            <div className="text-center p-5 bg-yellow-900/20 border border-yellow-700/30 rounded-lg mb-4">
              <Icon icon="mdi:alert-circle-outline" className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
              <p className="text-yellow-300 font-medium mb-1">No Credential Found</p>
              <p className="text-sm text-yellow-200/80">
                You don't have a humanity credential yet. Click "Verify Humanity" to create one.
              </p>
            </div>
          ) : isVerified ? (
            <div className="text-center p-5 bg-green-900/20 border border-green-700/30 rounded-lg mb-4">
              <Icon icon="mdi:check-circle" className="h-10 w-10 text-green-500 mx-auto mb-3" />
              <p className="text-green-300 font-medium mb-1">Verification Successful</p>
              <p className="text-sm text-green-200/80">
                Your humanity has been verified! You can now proceed with your purchase.
              </p>
            </div>
          ) : error ? (
            <div className="text-center p-5 bg-red-900/20 border border-red-700/30 rounded-lg mb-4">
              <Icon icon="mdi:alert-circle" className="h-10 w-10 text-red-500 mx-auto mb-3" />
              <p className="text-red-300 font-medium mb-1">Verification Failed</p>
              <p className="text-sm text-red-200/80">{error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="h-12 w-12 relative flex-shrink-0 bg-primary/20 rounded-full flex items-center justify-center">
                  <Icon icon="mdi:shield-check" className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Privacy Preserved</h3>
                  <p className="text-sm text-gray-300">
                    Your credential will be verified without revealing any personal information.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-blue-900/10 rounded-lg border border-blue-700/20">
                <div className="h-12 w-12 relative flex-shrink-0 bg-blue-900/20 rounded-full flex items-center justify-center">
                  <Icon icon="mdi:account-check" className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Unique Human</h3>
                  <p className="text-sm text-gray-300">
                    This verification ensures that you are a unique human, preventing duplicate accounts.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="border-t border-gray-700 pt-4 flex justify-between">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleVerify} 
            disabled={isVerifying || isVerified}
            variant="primary"
            className={`${isVerifying ? 'bg-primary/70' : 'bg-primary'} text-darkmode font-medium px-6 py-2 min-w-[140px]`}
          >
            {isVerifying ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-darkmode border-t-transparent rounded-full" />
                <span>Verifying...</span>
              </div>
            ) : isVerified ? (
              <div className="flex items-center gap-2">
                <Icon icon="mdi:check" className="h-4 w-4" />
                <span>Verified</span>
              </div>
            ) : (
              'Verify Humanity'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HumanityVerificationDialog; 